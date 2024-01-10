import delay from "delay";
import { Memoize } from "fast-typescript-memoize";
import defaults from "lodash/defaults";
import random from "lodash/random";
import pTimeout from "p-timeout";
import { CachedRefreshedValue } from "../helpers/CachedRefreshedValue";
import { DefaultMap } from "../helpers/DefaultMap";
import type { DesperateAny, MaybeCallable, PickPartial } from "../helpers/misc";
import {
  nullthrows,
  mapJoin,
  runInVoid,
  objectHash,
  maybeCall,
  jsonHash,
} from "../helpers/misc";
import { Registry } from "../helpers/Registry";
import type { Client } from "./Client";
import { ClientError } from "./ClientError";
import { Island } from "./Island";
import type { Loggers } from "./Loggers";
import type { STALE_REPLICA } from "./Shard";
import { MASTER, Shard } from "./Shard";
import { ShardError } from "./ShardError";

/**
 * Options for Cluster constructor.
 */
export interface ClusterOptions<TClient extends Client, TNode> {
  /** Islands configuration of the Cluster. */
  islands: MaybeCallable<
    ReadonlyArray<{ no: number; nodes: readonly TNode[] }>
  >;
  /** Given a node of some Island, instantiates a Client for this node. Called
   * when a new node appears in the Cluster statically or dynamically. */
  createClient: (node: TNode) => TClient;
  /** How often to run Shards rediscovery in normal circumstances. */
  shardsDiscoverIntervalMs?: MaybeCallable<number>;
  /** How often to recheck for changes in options.islands (typically, often,
   * since it's assumed that options.islands calculation is cheap). If the
   * Cluster configuration is changed, then we trigger rediscovery ASAP. */
  shardsDiscoverRecheckIslandsIntervalMs?: MaybeCallable<number>;
  /** If there were DB errors during Shards discovery (e.g. transport errors,
   * which is rare), the discovery is retried that many times before giving up
   * and throwing the error through. The number here can be high, because
   * rediscovery happens in background. */
  shardsDiscoverErrorRetryCount?: MaybeCallable<number>;
  /** If there were DB errors during Shards discovery (rare), this is how much
   * we wait between attempts. */
  shardsDiscoverErrorRetryDelayMs?: MaybeCallable<number>;
  /** If we think that we know Island of a particular Shard, but an attempt to
   * access it fails, this means that maybe the Shard is migrating to another
   * Island. In this case, we wait a bit and retry that many times. We should
   * not do it too many times though, because all DB requests will be blocked
   * waiting for the resolution. */
  locateIslandErrorRetryCount?: MaybeCallable<number>;
  /** How much time to wait between the retries mentioned above. The time here
   * should be just enough to wait for switching the Shard from one Island to
   * another (typically quick). */
  locateIslandErrorRetryDelayMs?: MaybeCallable<number>;
}

/**
 * Holds the complete auto-discovered list of Islands and a map of Shards to
 * figure out, which Island holds which Shard.
 */
interface DiscoveredShards<TClient extends Client> {
  islandsMap: Map<number, Island<TClient>>;
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
export class Cluster<TClient extends Client, TNode = DesperateAny> {
  /** Default values for the constructor options. */
  static readonly DEFAULT_OPTIONS: Required<
    PickPartial<ClusterOptions<Client, never>>
  > = {
    shardsDiscoverIntervalMs: 10000,
    shardsDiscoverRecheckIslandsIntervalMs: 500,
    shardsDiscoverErrorRetryCount: 3,
    shardsDiscoverErrorRetryDelayMs: 3000,
    locateIslandErrorRetryCount: 2,
    locateIslandErrorRetryDelayMs: 1000,
  };

  /** The complete registry of all initialized Clients. Cluster nodes may change
   * at runtime, so once a new node appears, its Client is added to the
   * registry. Also, the Clients of disappeared nodes are eventually removed
   * from the registry on the next Shards discovery. */
  private clientRegistry: Registry<TNode, Client>;
  /** The complete registry of all Islands ever created. If some Island changes
   * configuration, its old version is eventually removed from the registry
   * during the next Shards discovery. */
  private islandRegistry: Registry<
    { nodes: readonly TNode[]; clients: readonly Client[] },
    Island<Client>
  >;
  /** Represents the result of the recent successful Shards discovery. */
  private discoverShardsCache: CachedRefreshedValue<DiscoveredShards<TClient>>;
  /** A handler which extracts Shard number from an ID (derived from some node's
   * Client assuming they all have the same logic). */
  private shardNoByID: (id: string) => number;
  /** Once set to true, Clients for newly appearing nodes will be pre-warmed. */
  private prewarmEnabled = false;

  /** Cluster configuration options. */
  readonly options: Required<ClusterOptions<TClient, TNode>>;
  /** Cluster logging handlers (derived from some node's Client). */
  readonly loggers: Loggers;

  constructor(options: ClusterOptions<TClient, TNode>) {
    this.options = defaults({}, options, Cluster.DEFAULT_OPTIONS);

    this.clientRegistry = new Registry<TNode, Client>({
      key: (node) => jsonHash(node),
      create: (node) => this.options.createClient(node),
      end: async (client) => {
        const startTime = performance.now();
        await client.end().catch((error) =>
          this.loggers.swallowedErrorLogger({
            where: `${this.constructor.name}.clientRegistry`,
            error,
            elapsed: performance.now() - startTime,
          })
        );
      },
    });

    this.islandRegistry = new Registry({
      key: ({ nodes }) => jsonHash(nodes),
      create: ({ clients }) => new Island(clients),
    });

    const [client] = this.clientRegistry.getOrCreate(
      nullthrows(
        maybeCall(options.islands).find(({ nodes }) => nodes.length > 0),
        "The Cluster must have Islands with nodes"
      ).nodes[0]
    );
    this.shardNoByID = client.shardNoByID.bind(client);
    this.loggers = client.options.loggers;

    this.discoverShardsCache = new CachedRefreshedValue({
      delayMs: () => maybeCall(this.options.shardsDiscoverIntervalMs),
      warningTimeoutMs: () => maybeCall(this.options.shardsDiscoverIntervalMs), // assume to not spend >50% of the time on discovering Shards
      deps: {
        delayMs: () =>
          maybeCall(this.options.shardsDiscoverRecheckIslandsIntervalMs),
        handler: () => jsonHash(maybeCall(this.options.islands)),
      },
      resolverFn: async () => this.discoverShardsExpensive(),
      delay: async (ms) => delay(ms),
      onError: (error, elapsed) =>
        this.loggers.swallowedErrorLogger({
          where: `${this.constructor.name}.discoverShardsCache`,
          error,
          elapsed,
        }),
    });
  }

  /**
   * Signals the Cluster to keep the Clients pre-warmed, e.g. open. (It's up to
   * the particular Client's implementation, what does a "pre-warmed Client"
   * mean; typically, it's keeping some minimal number of pooled connections.)
   */
  prewarm(): void {
    this.prewarmEnabled = true;
    runInVoid(async () => {
      const { islandsMap } = await this.discoverShardsCache.cached();
      for (const island of islandsMap.values()) {
        island.prewarm();
      }
    });
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
    return this.shardByNo(this.shardNoByID(id));
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
  async islands(): Promise<number[]> {
    const { islandsMap } = await this.discoverShardsCache.cached();
    return [...islandsMap.keys()];
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
    const { islandsMap } = await this.discoverShardsCache.cached();
    const island = nullthrows(
      islandsMap.get(islandNo),
      () => `Unknown island ${islandNo}`
    );
    return freshness === MASTER ? island.master() : island.replica();
  }

  /**
   * Triggers shards rediscovery and finishes as soon as it's done. To be used
   * in unit tests mostly, because in real life, it's enough to just modify the
   * cluster configuration.
   */
  async rediscover(): Promise<void> {
    await this.discoverShardsCache.waitRefresh();
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
        const { shardNoToIslandNo, islandsMap } =
          await this.discoverShardsCache.cached();
        const islandNo = shardNoToIslandNo.get(shardNo);
        if (islandNo === undefined) {
          const masterNames = [...islandsMap.entries()]
            .map(([no, island]) => `${no}:${island.master().options.name}`)
            .join(", ");
          // We don't retry it to avoid DoS, since it could be e.g. a fake ID
          // passed to us by a user in some URL or something else.
          throw new ShardError(
            `Shard ${shardNo} is not discoverable (no such Shard in the Cluster? some Islands are down? connections limit?)`,
            masterNames
          );
        } else {
          return this.islandClient(islandNo, freshness);
        }
      },
      onRunError: async (attempt: number, error: unknown) => {
        // E.g. a Shard is relocated to another Island, or a master node
        // suddenly appears as replica (e.g. a switchover happened).
        if (
          error instanceof ClientError &&
          error.postAction === "rediscover" &&
          attempt < maybeCall(this.options.locateIslandErrorRetryCount)
        ) {
          await delay(maybeCall(this.options.locateIslandErrorRetryDelayMs));
          // Timeout, or we may wait forever if an Island is completely down.
          const startTime = performance.now();
          await pTimeout(
            this.discoverShardsCache.waitRefresh(),
            // Timeout = delay between fetches + warning timeout for a fetch.
            maybeCall(this.options.shardsDiscoverIntervalMs) * 2,
            "Timed out while waiting for shards discovery."
          ).catch((error) =>
            this.loggers.swallowedErrorLogger({
              where: `${this.constructor.name}.shardByNo: waitRefresh`,
              error,
              elapsed: performance.now() - startTime,
            })
          );
          return "retry";
        }

        // E.g. an attempt to use a Client which is end()'ed already: trigger
        // a retry which will choose another Client. This may happen when e.g.
        // a Client instance is returned to the Shards logic, and immediately
        // after that it's been end()'ed due to a rediscovery succeeding and
        // recycling the old Clients. We can't control the lifetime of Client
        // instances returned to the caller (i.e. there is always a chance
        // that the caller will try to use the Client after it's been
        // end()'ed), but at least for Shards logic, we are able to retry.
        if (
          error instanceof ClientError &&
          error.postAction === "choose-another-client" &&
          attempt < maybeCall(this.options.locateIslandErrorRetryCount)
        ) {
          return "retry";
        }

        // Giving up on retries.
        return "throw";
      },
    });
  }

  /**
   * Runs the actual Shards discovery queries over all Islands and updates the
   * mapping from each Shard number to an Island where it lives. These queries
   * may be expensive, so it's expected that the return Promise is heavily
   * cached by the caller code.
   */
  private async discoverShardsExpensive(
    retriesLeft = maybeCall(this.options.shardsDiscoverErrorRetryCount)
  ): Promise<DiscoveredShards<TClient>> {
    const seenKeys = new Set<string>();
    const islandsMap = new Map<number, Island<TClient>>(
      maybeCall(this.options.islands).map(({ no, nodes }) => {
        const clients = nodes.map((node) => {
          const [client, key] = this.clientRegistry.getOrCreate(node);
          seenKeys.add(key);
          this.prewarmEnabled && client.prewarm();
          return client;
        });
        const [island, key] = this.islandRegistry.getOrCreate({
          nodes,
          clients,
        });
        seenKeys.add(key);
        return [no, island as Island<TClient>];
      })
    );

    try {
      const shardNoToIslandNo = new Map<number, number>();
      const islandNoToShardNos = new DefaultMap<number, number[]>();
      const nonGlobalShardNos: number[] = [];

      await mapJoin([...islandsMap.entries()], async ([islandNo, island]) => {
        const shardNos = await island.shardNos();
        for (const shardNo of shardNos) {
          const otherIslandNo = shardNoToIslandNo.get(shardNo);
          if (otherIslandNo !== undefined) {
            throw Error(
              `Shard #${shardNo} exists in more than one island: ` +
                islandsMap.get(otherIslandNo)?.master().options.name +
                `(${otherIslandNo})` +
                " and " +
                island.master().options.name +
                `(${islandNo})`
            );
          }

          shardNoToIslandNo.set(shardNo, islandNo);
          islandNoToShardNos.getOrAdd(islandNo, Array).push(shardNo);
          if (shardNo !== 0) {
            nonGlobalShardNos.push(shardNo);
          }
        }

        islandNoToShardNos.get(islandNo)?.sort((a, b) => a - b);
      });

      // Gracefully delete and disconnect the Clients which didn't correspond to
      // the list of nodes mentioned in this.options.islands, and also, delete
      // leftover Islands which are not used anymore. In case we don't reach
      // this point and threw earlier, it will eventually be reached on the next
      // Shards discovery iterations.
      for (const registry of [this.clientRegistry, this.islandRegistry]) {
        runInVoid(registry.deleteExcept(seenKeys));
      }

      return {
        islandsMap,
        shardNoToIslandNo,
        islandNoToShardNos,
        nonGlobalShardNos: nonGlobalShardNos.sort((a, b) => a - b),
      };
    } catch (e: unknown) {
      if (retriesLeft > 0) {
        await delay(maybeCall(this.options.shardsDiscoverErrorRetryDelayMs));
        return this.discoverShardsExpensive(retriesLeft - 1);
      } else {
        throw e;
      }
    }
  }
}
