import delay from "delay";
import { Memoize } from "fast-typescript-memoize";
import first from "lodash/first";
import omitBy from "lodash/omitBy";
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
  /** Islands configuration of the cluster. May be changed dynamically by
   * passing it as a getter. */
  islands: ReadonlyArray<{ no: number; nodes: readonly TNode[] }>;
  /** Given a node of some Island, instantiates a Client for this node. Called
   * when a new node appears in the cluster statically or dynamically. */
  createClient: (isMaster: boolean, node: TNode) => TClient;
  /** How often to run shards rediscovery in normal circumstances. */
  shardsDiscoverIntervalMs?: number;
  /** If there were DB errors during shards discovery (e.g. transport errors,
   * which is rare), the discovery is retried that many times before giving up
   * and throwing the error through. The number here can be high, because
   * rediscovery happens in background. */
  shardsDiscoverErrorRetryCount?: number;
  /** If there were DB errors during shards discovery (rare), this is how much
   * we wait between attempts. */
  shardsDiscoverErrorRetryDelayMs?: number;
  /** If we think that we know island of a particular shard, but an attempt to
   * access it fails, this means that maybe the shard is migrating to another
   * island. In this case, we wait a bit and retry that many times. We should
   * not do it too many times though, because all DB requests will be blocked
   * waiting for the resolution. */
  locateIslandErrorRetryCount?: number;
  /** How much time to wait between the retries mentioned above. The time here
   * should be just enough to wait for switching the shard from one island to
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
 * Holds the complete auto-discovered map of shards to figure out, which island
 * holds which shard.
 */
interface DiscoveredShards {
  shardNoToIslandNo: ReadonlyMap<number, number>;
  islandNoToShardNos: ReadonlyMap<number, readonly number[]>;
  nonGlobalShardNos: readonly number[];
}

/**
 * Cluster is a collection of islands and an orchestration of shardNo -> island
 * resolution.
 *
 * It's unknown beforehand, which island some particular shard belongs to; the
 * resolution is done asynchronously and lazily.
 *
 * Shard 0 is a special "global" shard.
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

    this.options = {
      ...DEFAULT_CLUSTER_OPTIONS,
      ...(omitBy(options, (v) => v === undefined) as ClusterOptions<
        TClient,
        TNode
      >),
    };
    this.firstIsland = firstIsland;
    this.loggers = this.firstIsland.master.loggers;
    this.discoverShardsCache = new CachedRefreshedValue({
      // We assume to not spend more than 50% of the time on discovering shards.
      warningTimeoutMs: this.options.shardsDiscoverIntervalMs,
      delayMs: this.options.shardsDiscoverIntervalMs,
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
   * If called once, keeps the clients pre-warmed, e.g. open. (It's up to the
   * particular Client's implementation, what does a "pre-warmed client" mean.)
   */
  prewarm(): void {
    for (const island of this.islandsMap.values()) {
      island.master.prewarm();
      island.replicas.forEach((client) => client.prewarm());
    }

    runInVoid(this.discoverShardsCache.cached());
  }

  /**
   * Returns a global Shard of the cluster. This method is made synchronous
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
   * Why is it important? Because shards may go up and down temporarily at
   * random moments of time. Imagine we made this method async and asserted that
   * the shard is actually available at the moment when the method is called.
   * What would happen if the Shard object was stored somewhere as "successful"
   * by the caller, then the island went down, and then a query is sent to the
   * shard in, say, 20 seconds? We'd get an absolutely different exception, at
   * the moment of the query. We don't want this to happen: we want all of the
   * exceptions to be thrown with a consistent call stack (e.g. at the moment of
   * the query), no matter whether it was an immediate call or a deferred one.
   */
  shard(id: string): Shard<TClient> {
    const shardNo = this.firstIsland.master.shardNoByID(id);
    return this.shardByNo(shardNo);
  }

  /**
   * Returns a random shard among the ones which are currently known
   * (discovered) in the cluster.
   */
  async randomShard(seed?: object): Promise<Shard<TClient>> {
    const { nonGlobalShardNos } = await this.discoverShardsCache.cached();

    let index;
    if (seed !== undefined) {
      const numHash = objectHash(seed).readUInt32BE();
      index = numHash % nonGlobalShardNos.length;
    } else {
      // TODO: implement power-of-two algorithm to pick the shard which is
      // smallest in size.
      index = random(0, nonGlobalShardNos.length - 1);
    }

    return this.shardByNo(nonGlobalShardNos[index]);
  }

  /**
   * Returns all currently known (discovered) non-global shards in the cluster.
   */
  async nonGlobalShards(): Promise<ReadonlyArray<Shard<TClient>>> {
    const { nonGlobalShardNos } = await this.discoverShardsCache.cached();
    return nonGlobalShardNos.map((shardNo) => this.shardByNo(shardNo));
  }

  /**
   * Returns all island numbers in the cluster.
   */
  islands(): number[] {
    return [...this.islandsMap.keys()];
  }

  /**
   * Returns all currently known (discovered) shards of a particular island.
   */
  async islandShards(island: number): Promise<Array<Shard<TClient>>> {
    const { islandNoToShardNos } = await this.discoverShardsCache.cached();
    return (
      islandNoToShardNos
        .get(island)
        ?.map((shardNo) => this.shardByNo(shardNo)) ?? []
    );
  }

  /**
   * Returns a Client of a particular Island.
   */
  async islandClient(
    island: number,
    freshness: typeof MASTER | typeof STALE_REPLICA
  ): Promise<TClient> {
    const { master, replicas } = nullthrows(
      this.islandsMap.get(island),
      "Unknown island"
    );
    return freshness === MASTER || replicas.length === 0
      ? master
      : replicas[Math.trunc(Math.random() * replicas.length)];
  }

  /**
   * The idea: for each shard number (even for non-discovered yet shard), we
   * keep the corresponding Shard object in a Memoize cache, so shards with the
   * same number always resolve into the same Shard object. Then, an actual
   * island locating process happens when the caller wants to get a Client of
   * that Shard (and it throws if such Shard hasn't been discovered actually).
   */
  @Memoize()
  private shardByNo(shardNo: number): Shard<TClient> {
    return new Shard(shardNo, {
      locateClient: async (freshness: typeof MASTER | typeof STALE_REPLICA) => {
        const { shardNoToIslandNo } = await this.discoverShardsCache.cached();
        const island = shardNoToIslandNo.get(shardNo);
        if (island === undefined) {
          const masterNames = [...this.islandsMap.entries()]
            .map(([no, { master }]) => `${no}:${master.name}`)
            .join(", ");
          throw new ShardError(
            `Shard ${shardNo} is not discoverable (some islands are down? connections limit? no such shard in the cluster?)`,
            masterNames,
            "rediscover"
          );
        } else {
          return this.islandClient(island, freshness);
        }
      },
      onRunError: async (attempt: number, error: unknown) => {
        if (
          error instanceof ShardError &&
          error.postAction === "rediscover" &&
          attempt < this.options.locateIslandErrorRetryCount
        ) {
          await delay(this.options.locateIslandErrorRetryDelayMs);
          // We must timeout here, otherwise we may wait forever if some island
          // is totally down.
          const startedAt = performance.now();
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
              elapsed: performance.now() - startedAt,
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
   * Runs the actual shards discovery queries over all islands and updates the
   * mapping from shard number to an island where it lives. These queries may be
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
        async ([island, { master }]) => {
          const shardNos = await master.shardNos();
          for (const shardNo of shardNos) {
            const otherIslandNo = shardNoToIslandNo.get(shardNo);
            if (otherIslandNo) {
              throw Error(
                `Shard #${shardNo} exists in more than one island (` +
                  master.name +
                  " and " +
                  this.islandsMap.get(otherIslandNo)?.master.name +
                  ")"
              );
            }

            shardNoToIslandNo.set(shardNo, island);
            islandNoToShardNos.getOrAdd(island, Array).push(shardNo);
            if (shardNo !== 0) {
              nonGlobalShardNos.push(shardNo);
            }
          }

          islandNoToShardNos.get(island)?.sort((a, b) => a - b);
        }
      );
      return {
        shardNoToIslandNo,
        islandNoToShardNos,
        nonGlobalShardNos: nonGlobalShardNos.sort((a, b) => a - b),
      };
    } catch (e) {
      if (retriesLeft > 0) {
        await delay(this.options.shardsDiscoverErrorRetryDelayMs);
        return this.discoverShardsExpensive(retriesLeft - 1);
      } else {
        throw e;
      }
    }
  }
}
