import delay from "delay";
import compact from "lodash/compact";
import first from "lodash/first";
import random from "lodash/random";
import hash from "object-hash";
import { mapJoin, runInVoid } from "../helpers";
import Memoize from "../Memoize";
import type { Client } from "./Client";
import { Shard } from "./Shard";
import ShardError from "./ShardError";

const DISCOVER_ERROR_RETRY_ATTEMPTS = 1;
const DISCOVER_ERROR_RETRY_DELAY_MS = 3000;

/**
 * Holds the complete auto-discovered map of shards to figure out, which island
 * holds which shard.
 */
interface DiscoveredShards<TClient extends Client> {
  shardNoToIsland: ReadonlyMap<number, Island<TClient>>;
  nonGlobalShards: ReadonlyArray<Shard<TClient>>;
}

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
 * Cluster is a collection of islands and an orchestration
 * of shardNo -> island resolution.
 *
 * It's unknown beforehand, which island some particular shard belongs to;
 * the resolution is done asynchronously and lazily.
 *
 * Shard 0 is a special "global" shard.
 */
export class Cluster<TClient extends Client> {
  private discoverShardsCache: Promise<DiscoveredShards<TClient>> | null = null;
  private firstIsland;

  readonly islands: ReadonlyMap<number, Island<TClient>>;

  constructor(
    islands: ReadonlyArray<Island<TClient>>,
    public readonly shardsRediscoverMs: number = 10000
  ) {
    const firstIsland = first(islands);
    if (!firstIsland) {
      throw Error("The cluster has no islands");
    }

    this.firstIsland = firstIsland;
    this.islands = new Map(islands.map((island) => [island.no, island]));
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
    return new Shard(shardNo, async () => {
      const { shardNoToIsland } = await this.discoverShards();
      const shard = shardNoToIsland.get(shardNo);
      if (!shard) {
        const masterNames = [...this.islands.values()]
          .map((island) => island.master.name)
          .join(", ");
        throw new ShardError(
          `Shard ${shardNo} is not discoverable (some islands are down? connections limit? no such shard in the cluster?) on [${masterNames}]`
        );
      } else {
        return shard;
      }
    });
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
   * Returns the cached Shard-to-Island mapping. Once called, we schedule a
   * chain of re-discovery operations.
   */
  private async discoverShards() {
    if (!this.discoverShardsCache) {
      this.discoverShardsCache = this.islandsByShardsExpensive();
      // Schedule re-discovery in background to refresh the cache in the future.
      setTimeout(() => {
        this.discoverShardsCache = null;
        runInVoid(this.discoverShards());
      }, this.shardsRediscoverMs);
    }

    return this.discoverShardsCache;
  }

  /**
   * Runs the actual shards discovery queries over all islands and updates the
   * mapping from shard number to an island where it lives. These queries may be
   * expensive, so it's expected that the return Promise is heavily cached by
   * the caller code.
   */
  private async islandsByShardsExpensive(
    retriesLeft = DISCOVER_ERROR_RETRY_ATTEMPTS
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
        await delay(DISCOVER_ERROR_RETRY_DELAY_MS);
        return this.islandsByShardsExpensive(retriesLeft - 1);
      } else {
        throw e;
      }
    }
  }
}
