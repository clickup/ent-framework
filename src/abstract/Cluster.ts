import delay from "delay";
import { Memoize } from "fast-typescript-memoize";
import defaults from "lodash/defaults";
import first from "lodash/first";
import random from "lodash/random";
import pTimeout from "p-timeout";
import { CachedRefreshedValue } from "../helpers/CachedRefreshedValue";
import { DefaultMap } from "../helpers/DefaultMap";
import type { PickPartial } from "../helpers/misc";
import { nullthrows, mapJoin, runInVoid, objectHash } from "../helpers/misc";
import type { Client } from "./Client";
import { Island } from "./Island";
import type { Loggers } from "./Loggers";
import type { STALE_REPLICA } from "./Shard";
import { MASTER, Shard } from "./Shard";
import { ShardError } from "./ShardError";

/**
 * Options for Cluster constructor.
 */
export interface ClusterOptions<TClient extends Client, TNode> {
  /** Islands configuration of the Cluster. May be changed dynamically by
   * passing it as a getter. */
  islands: ReadonlyArray<{ no: number; nodes: readonly TNode[] }>;
  /** Given a node of some Island, instantiates a Client for this node. Called
   * when a new node appears in the Cluster statically or dynamically. */
  createClient: (isMaster: boolean, node: TNode) => TClient;
  /** How often to run Shards rediscovery in normal circumstances. */
  shardsDiscoverIntervalMs?: number;
  /** If there were DB errors during Shards discovery (e.g. transport errors,
   * which is rare), the discovery is retried that many times before giving up
   * and throwing the error through. The number here can be high, because
   * rediscovery happens in background. */
  shardsDiscoverErrorRetryCount?: number;
  /** If there were DB errors during Shards discovery (rare), this is how much
   * we wait between attempts. */
  shardsDiscoverErrorRetryDelayMs?: number;
  /** If we think that we know Island of a particular Shard, but an attempt to
   * access it fails, this means that maybe the Shard is migrating to another
   * Island. In this case, we wait a bit and retry that many times. We should
   * not do it too many times though, because all DB requests will be blocked
   * waiting for the resolution. */
  locateIslandErrorRetryCount?: number;
  /** How much time to wait between the retries mentioned above. The time here
   * should be just enough to wait for switching the Shard from one Island to
   * another (typically quick). */
  locateIslandErrorRetryDelayMs?: number;
}

/**
 * Default values for ClusterOptions if not passed.
 */
const DEFAULT_CLUSTER_OPTIONS: Required<PickPartial<ClusterOptions<any, any>>> =
  {
    shardsDiscoverIntervalMs: 10000,
    shardsDiscoverErrorRetryCount: 3,
    shardsDiscoverErrorRetryDelayMs: 3000,
    locateIslandErrorRetryCount: 2,
    locateIslandErrorRetryDelayMs: 1000,
  };

/**
 * Holds the complete auto-discovered map of Shards to figure out, which Island
 * holds which Shard.
 */
interface DiscoveredShards {
  shardNoToIslandNo: ReadonlyMap<number, number>;
  islandNoToShardNos: ReadonlyMap<number, readonly number[]>;
  nonGlobalShardNos: readonly number[];
}

/**
 * Cluster is a collection of Islands and an orchestration of shardNo -> Island
 * resolution.
 *
 * It's unknown beforehand, which Island some particular Shard belongs to; the
 * resolution is done asynchronously and lazily.
 *
 * Shard 0 is a special "global" Shard.
 */
export class Cluster<TClient extends Client, TNode = any> {
  private discoverShardsCache: CachedRefreshedValue<DiscoveredShards>;
  private islandsMap: Map<number, Island<TClient>>;
  private firstIsland;

  readonly options: Required<ClusterOptions<TClient, TNode>>;
  readonly loggers: Loggers;

  constructor(options: ClusterOptions<TClient, TNode>) {
    this.islandsMap = new Map(
      options.islands.map(({ no, nodes }) => [
        no,
        new Island<TClient>(
          options.createClient(true, nodes[0]),
          nodes.slice(1).map((node) => options.createClient(false, node))
        ),
      ])
    );
    const firstIsland = first([...this.islandsMap.values()]);
    if (!firstIsland) {
      throw Error("The cluster has no islands");
    }

    this.options = defaults({ ...options }, DEFAULT_CLUSTER_OPTIONS);
    this.firstIsland = firstIsland;
    this.loggers = this.firstIsland.master.loggers;
    const thisOptions = this.options;
    this.discoverShardsCache = new CachedRefreshedValue({
      get warningTimeoutMs() {
        // We assume to not spend >50% of the time on discovering Shards.
        return thisOptions.shardsDiscoverIntervalMs;
      },
      get delayMs() {
        return thisOptions.shardsDiscoverIntervalMs;
      },
      resolverFn: async () => this.discoverShardsExpensive(),
      delay: async (ms) => delay(ms),
      onError: (error) => {
        this.loggers.swallowedErrorLogger({
          where: `${this.constructor.name}: ${this.discoverShardsExpensive.name}`,
          error,
          elapsed: null,
        });
      },
    });
  }

  /**
   * If called once, keeps the Clients pre-warmed, e.g. open. (It's up to the
   * particular Client's implementation, what does a "pre-warmed Client" mean.)
   */
  prewarm(): void {
    for (const island of this.islandsMap.values()) {
      island.master.prewarm();
      island.replicas.forEach((client) => client.prewarm());
    }

    runInVoid(this.discoverShardsCache.cached());
  }

  /**
   * Returns a global Shard of the Cluster. This method is made synchronous
   * intentionally, to defer the I/O and possible errors to the moment of the
   * actual query.
   */
  globalShard(): Shard<TClient> {
    return this.shardByNo(0);
  }

  /**
   * Returns Shard of a particular id. This method is made synchronous
   * intentionally, to defer the I/O and possible errors to the moment of the
   * actual query.
   *
   * Why is it important? Because Shards may go up and down temporarily at
   * random moments of time. Imagine we made this method async and asserted that
   * the Shard is actually available at the moment when the method is called.
   * What would happen if the Shard object was stored somewhere as "successful"
   * by the caller, then the Island went down, and then a query is sent to the
   * Shard in, say, 20 seconds? We'd get an absolutely different exception, at
   * the moment of the query. We don't want this to happen: we want all of the
   * exceptions to be thrown with a consistent call stack (e.g. at the moment of
   * the query), no matter whether it was an immediate call or a deferred one.
   */
  shard(id: string): Shard<TClient> {
    const shardNo = this.firstIsland.master.shardNoByID(id);
    return this.shardByNo(shardNo);
  }

  /**
   * Returns a random Shard among the ones which are currently known
   * (discovered) in the Cluster.
   */
  async randomShard(seed?: object): Promise<Shard<TClient>> {
    const { nonGlobalShardNos } = await this.discoverShardsCache.cached();

    let index;
    if (seed !== undefined) {
      const numHash = objectHash(seed).readUInt32BE();
      index = numHash % nonGlobalShardNos.length;
    } else {
      // TODO: implement power-of-two algorithm to pick the Shard which is
      // smallest in size.
      index = random(0, nonGlobalShardNos.length - 1);
    }

    return this.shardByNo(nonGlobalShardNos[index]);
  }

  /**
   * Returns all currently known (discovered) non-global Shards in the Cluster.
   */
  async nonGlobalShards(): Promise<ReadonlyArray<Shard<TClient>>> {
    const { nonGlobalShardNos } = await this.discoverShardsCache.cached();
    return nonGlobalShardNos.map((shardNo) => this.shardByNo(shardNo));
  }

  /**
   * Returns all Island numbers in the Cluster.
   */
  islands(): number[] {
    return [...this.islandsMap.keys()];
  }

  /**
   * Returns all currently known (discovered) Shards of a particular Island.
   */
  async islandShards(islandNo: number): Promise<Array<Shard<TClient>>> {
    const { islandNoToShardNos } = await this.discoverShardsCache.cached();
    return (
      islandNoToShardNos
        .get(islandNo)
        ?.map((shardNo) => this.shardByNo(shardNo)) ?? []
    );
  }

  /**
   * Returns a Client of a particular Island.
   */
  async islandClient(
    islandNo: number,
    freshness: typeof MASTER | typeof STALE_REPLICA
  ): Promise<TClient> {
    const island = nullthrows(this.islandsMap.get(islandNo), "Unknown island");
    return freshness === MASTER || island.replicas.length === 0
      ? island.master
      : island.replicas[Math.trunc(Math.random() * island.replicas.length)];
  }

  /**
   * The idea: for each Shard number (even for non-discovered yet Shard), we
   * keep the corresponding Shard object in a Memoize cache, so Shards with the
   * same number always resolve into the same Shard object. Then, an actual
   * Island locating process happens when the caller wants to get a Client of
   * that Shard (and it throws if such Shard hasn't been discovered actually).
   */
  @Memoize()
  private shardByNo(shardNo: number): Shard<TClient> {
    return new Shard(shardNo, {
      locateClient: async (freshness: typeof MASTER | typeof STALE_REPLICA) => {
        const { shardNoToIslandNo } = await this.discoverShardsCache.cached();
        const islandNo = shardNoToIslandNo.get(shardNo);
        if (islandNo === undefined) {
          const masterNames = [...this.islandsMap.entries()]
            .map(([no, { master }]) => `${no}:${master.name}`)
            .join(", ");
          throw new ShardError(
            `Shard ${shardNo} is not discoverable (some islands are down? connections limit? no such Shard in the cluster?)`,
            masterNames,
            "rediscover"
          );
        } else {
          return this.islandClient(islandNo, freshness);
        }
      },
      onRunError: async (attempt: number, error: unknown) => {
        if (
          error instanceof ShardError &&
          error.postAction === "rediscover" &&
          attempt < this.options.locateIslandErrorRetryCount
        ) {
          await delay(this.options.locateIslandErrorRetryDelayMs);
          // We must timeout here, otherwise we may wait forever if some Island
          // is totally down.
          const startTime = performance.now();
          await pTimeout(
            this.discoverShardsCache.waitRefresh(),
            // Timeout = delay between fetches + warning timeout
            // for a fetch.
            this.options.shardsDiscoverIntervalMs * 2,
            "Timed out while waiting for shards discovery."
          ).catch((error) =>
            this.loggers.swallowedErrorLogger({
              where: `${this.constructor.name}.${this.shardByNo.name}: waitRefresh`,
              error,
              elapsed: performance.now() - startTime,
            })
          );
          return "retry";
        } else {
          return "throw";
        }
      },
    });
  }

  /**
   * Runs the actual Shards discovery queries over all Islands and updates the
   * mapping from Shard number to an Island where it lives. These queries may be
   * expensive, so it's expected that the return Promise is heavily cached by
   * the caller code.
   */
  private async discoverShardsExpensive(
    retriesLeft = this.options.shardsDiscoverErrorRetryCount
  ): Promise<DiscoveredShards> {
    try {
      const shardNoToIslandNo = new Map<number, number>();
      const islandNoToShardNos = new DefaultMap<number, number[]>();
      const nonGlobalShardNos: number[] = [];
      await mapJoin(
        [...this.islandsMap.entries()],
        async ([islandNo, island]) => {
          const shardNos = await island.shardNos();
          for (const shardNo of shardNos) {
            const otherIslandNo = shardNoToIslandNo.get(shardNo);
            if (otherIslandNo) {
              throw Error(
                `Shard #${shardNo} exists in more than one island (` +
                  island.master.name +
                  " and " +
                  this.islandsMap.get(otherIslandNo)?.master.name +
                  ")"
              );
            }

            shardNoToIslandNo.set(shardNo, islandNo);
            islandNoToShardNos.getOrAdd(islandNo, Array).push(shardNo);
            if (shardNo !== 0) {
              nonGlobalShardNos.push(shardNo);
            }
          }

          islandNoToShardNos.get(islandNo)?.sort((a, b) => a - b);
        }
      );
      return {
        shardNoToIslandNo,
        islandNoToShardNos,
        nonGlobalShardNos: nonGlobalShardNos.sort((a, b) => a - b),
      };
    } catch (e: unknown) {
      if (retriesLeft > 0) {
        await delay(this.options.shardsDiscoverErrorRetryDelayMs);
        return this.discoverShardsExpensive(retriesLeft - 1);
      } else {
        throw e;
      }
    }
  }
}
