import delay from "delay";
import { Memoize } from "fast-typescript-memoize";
import compact from "lodash/compact";
import first from "lodash/first";
import omitBy from "lodash/omitBy";
import random from "lodash/random";
import hash from "object-hash";
import { mapJoin, runInVoid } from "../helpers/misc";
import type { Client } from "./Client";
import type { Loggers } from "./Loggers";
import type { ShardOptions } from "./Shard";
import { Shard } from "./Shard";
import { ShardError } from "./ShardError";

/**
 * Island is 1 master + N replicas.
 * One island typically hosts multiple shards.
 */
export class Island<TClient extends Client> {
  constructor(
    public readonly no: number,
    public readonly master: TClient,
    public readonly replicas: TClient[]
  ) {}
}

/**
 * Options for Cluster constructor.
 */
export interface ClusterOptions {
  /** How often to run shards rediscovery in normal circumstances. */
  readonly shardsDiscoverIntervalMs: number;
  /** If there were DB errors during shards discovery (e.g. transport errors,
   * which is rare), the discovery is retried that many times before giving up
   * and throwing the error through. The number here can be high, because
   * rediscovery happens in background. */
  readonly shardsDiscoverErrorRetryCount: number;
  /** If there were DB errors during shards discovery (rare), this is how much
   * we wait between attempts. */
  readonly shardsDiscoverErrorRetryDelayMs: number;
  /** If we think that we know island of a particular shard, but an attempt to
   * access it fails, this means that maybe the shard is migrating to another
   * island. In this case, we wait a bit and retry that many times. We should
   * not do it too many times though, because all DB requests will be blocked
   * waiting for the resolution. */
  readonly locateIslandErrorRetryCount: number;
  /** How much time to wait between the retries mentioned above. The time here
   * should be just enough to wait for switching the shard from one island to
   * another (typically quick). */
  readonly locateIslandErrorRetryDelayMs: number;
}

/**
 * Default values for ClusterOptions if not passed.
 */
const DEFAULT_CLUSTER_OPTIONS: ClusterOptions = {
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
interface DiscoveredShards<TClient extends Client> {
  shardNoToIsland: ReadonlyMap<number, Island<TClient>>;
  nonGlobalShards: ReadonlyArray<Shard<TClient>>;
}

/**
 * Cluster is a collection of islands and an orchestration
 * of shardNo -> island resolution.
 *
 * It's unknown beforehand, which island some particular shard belongs to;
 * the resolution is done asynchronously and lazily.
 *
 * Shard 0 is a special "global" shard.
 */
export class Cluster<TClient extends Client> {
  private discoverShardsCache = {
    wait: null as Promise<void> | null,
    timeout: null as NodeJS.Timeout | null,
    cache: null as Promise<DiscoveredShards<TClient>> | null,
  };
  private firstIsland;

  readonly islands: ReadonlyMap<number, Island<TClient>>;
  readonly options: ClusterOptions;
  readonly loggers: Loggers;

  constructor(
    islands: ReadonlyArray<Island<TClient>>,
    options: Partial<ClusterOptions> = {}
  ) {
    const firstIsland = first(islands);
    if (!firstIsland) {
      throw Error("The cluster has no islands");
    }

    this.options = {
      ...DEFAULT_CLUSTER_OPTIONS,
      ...omitBy(options, (v) => v === undefined),
    };
    this.firstIsland = firstIsland;
    this.islands = new Map(islands.map((island) => [island.no, island]));
    this.loggers = this.firstIsland.master.loggers;
  }

  /**
   * If called once, keeps the clients pre-warmed, e.g. open. (It's up to the
   * particular Client's implementation, what does a "pre-warmed client" mean.)
   */
  prewarm() {
    for (const island of this.islands.values()) {
      island.master.prewarm();
      island.replicas.forEach((client) => client.prewarm());
    }

    runInVoid(this.discoverShards());
  }

  /**
   * Returns a global Shard of the cluster. This method is made synchronous
   * intentionally, to defer the I/O and possible errors to the moment of the
   * actual query.
   */
  globalShard() {
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
  shard(id: string) {
    const shardNo = this.firstIsland.master.shardNoByID(id);
    return this.shardByNo(shardNo);
  }

  /**
   * The idea: for each shard number (even for non-discovered yet shard), we
   * keep the corresponding Shard object in a Memoize cache, so shards with the
   * same number always resolve into the same Shard object. Then, an actual
   * island locating process happens when the caller wants to get a Client of
   * that Shard (and it throws if such Shard hasn't been discovered actually).
   */
  @Memoize()
  shardByNo(shardNo: number) {
    const shardOptions: ShardOptions<TClient> = {
      locateIsland: async () => {
        for (let attempt = 0; ; attempt++) {
          try {
            const { shardNoToIsland } = await this.discoverShards();
            const island = shardNoToIsland.get(shardNo);
            if (!island) {
              const masterNames = [...this.islands.values()]
                .map((island) => island.master.name)
                .join(", ");
              throw new ShardError(
                `Shard ${shardNo} is not discoverable (some islands are down? connections limit? no such shard in the cluster?) on [${masterNames}]`,
                masterNames
              );
            } else {
              return island;
            }
          } catch (error: unknown) {
            if ((await shardOptions.onRunError(attempt, error)) === "retry") {
              continue;
            } else {
              throw error;
            }
          }
        }
      },
      onRunError: async (attempt: number, error: unknown) => {
        if (
          error instanceof ShardError &&
          attempt < this.options.locateIslandErrorRetryCount
        ) {
          await this.discoverShards(this.options.locateIslandErrorRetryDelayMs);
          return "retry";
        } else {
          return "throw";
        }
      },
    };
    return new Shard(shardNo, shardOptions);
  }

  /**
   * Returns all currently known (discovered) non-global shards in the cluster.
   */
  async nonGlobalShards() {
    const { nonGlobalShards } = await this.discoverShards();
    return nonGlobalShards;
  }

  /**
   * Returns a random shard among the ones which are currently known
   * (discovered) in the cluster.
   */
  async randomShard(seed?: object) {
    const { nonGlobalShards } = await this.discoverShards();

    let index;
    if (seed !== undefined) {
      const numHash = hash(seed, {
        algorithm: "md5",
        encoding: "buffer",
      }).readUInt32BE();
      index = numHash % nonGlobalShards.length;
    } else {
      // TODO: implement power-of-two algorithm to pick the shard which is
      // smallest in size.
      index = random(0, nonGlobalShards.length - 1);
    }

    return nonGlobalShards[index];
  }

  /**
   * Returns all currently known (discovered) shards of a particular island.
   */
  async islandShards(islandNo: number) {
    const { shardNoToIsland } = await this.discoverShards();
    return compact(
      [...shardNoToIsland.entries()].map(([shardNo, island]) =>
        island.no === islandNo ? this.shardByNo(shardNo) : null
      )
    );
  }

  /**
   * Returns the cached Shard-to-Island mapping.
   *
   * - Once called, we schedule an endless chain of background re-discovery
   *   operations.
   * - The result is cached, so next calls will return it immediately in most of
   *   the cases.
   * - Once every shardsDiscoverIntervalMs we reset the cache and re-discover.
   *   If during the re-discovery someone else tries to call the method, this
   *   call will be coalesced with the re-discovery queries.
   * - If waitMsAndResetCache is passed, it means that we want to wait that
   *   number of ms, then reset the cache and rediscover. If during that wait
   *   period someone else also wants to reset the cache, this "cache reset"
   *   order will be coalesced with the existing one.
   */
  private async discoverShards(waitMsAndResetCache = 0) {
    const isLeaderToResetCache =
      waitMsAndResetCache > 0 && !this.discoverShardsCache.wait;

    if (isLeaderToResetCache) {
      this.discoverShardsCache.wait = delay(waitMsAndResetCache);
    }

    if (waitMsAndResetCache > 0) {
      await this.discoverShardsCache.wait;
    }

    if (isLeaderToResetCache) {
      this.discoverShardsCache.timeout &&
        clearTimeout(this.discoverShardsCache.timeout);
      this.discoverShardsCache.wait = null;
      this.discoverShardsCache.timeout = null;
      this.discoverShardsCache.cache = null;
    }

    if (!this.discoverShardsCache.cache) {
      this.discoverShardsCache.cache = this.islandsByShardsExpensive();
      // Schedule re-discovery in background to refresh the cache in the future.
      this.discoverShardsCache.timeout = setTimeout(() => {
        this.discoverShardsCache.timeout = null;
        this.discoverShardsCache.cache = null;
        runInVoid(this.discoverShards());
      }, this.options.shardsDiscoverIntervalMs);
    }

    return this.discoverShardsCache.cache!;
  }

  /**
   * Runs the actual shards discovery queries over all islands and updates the
   * mapping from shard number to an island where it lives. These queries may be
   * expensive, so it's expected that the return Promise is heavily cached by
   * the caller code.
   */
  private async islandsByShardsExpensive(
    retriesLeft = this.options.shardsDiscoverErrorRetryCount
  ): Promise<DiscoveredShards<TClient>> {
    try {
      const islandsByShard = new Map<number, Island<TClient>>();
      await mapJoin([...this.islands.values()], async (island) => {
        const shardNos = await island.master.shardNos();
        for (const shardNo of shardNos) {
          const otherIsland = islandsByShard.get(shardNo);
          if (otherIsland) {
            throw Error(
              `Shard #${shardNo} exists in more than one island ` +
                `(${island.master.name} and ${otherIsland?.master.name})`
            );
          }

          islandsByShard.set(shardNo, island);
        }
      });
      return {
        shardNoToIsland: islandsByShard,
        nonGlobalShards: [...islandsByShard.keys()]
          .filter((shardNo) => shardNo !== 0)
          .sort()
          .map((shardNo) => this.shardByNo(shardNo)),
      };
    } catch (e) {
      if (retriesLeft > 0) {
        await delay(this.options.shardsDiscoverErrorRetryDelayMs);
        return this.islandsByShardsExpensive(retriesLeft - 1);
      } else {
        throw e;
      }
    }
  }
}
