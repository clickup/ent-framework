import delay from "delay";
import compact from "lodash/compact";
import random from "lodash/random";
import range from "lodash/range";
import { mapJoin, runInVoid } from "../helpers";
import { Client } from "./Client";
import { Shard } from "./Shard";

const DISCOVER_ERROR_RETRY_ATTEMPTS = 1;
const DISCOVER_ERROR_RETRY_DELAY_MS = 3000;

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
  readonly shards: ReadonlyMap<number, Shard<TClient>>;
  readonly islands: ReadonlyMap<number, Island<TClient>>;
  private islandsByShardsCache:
    | Promise<ReadonlyMap<number, Island<TClient>>>
    | undefined;

  constructor(
    public readonly numReadShards: number,
    public readonly numWriteShards: number,
    islands: ReadonlyArray<Island<TClient>>,
    public readonly shardsRediscoverMs: number = 10000
  ) {
    if (this.numWriteShards > this.numReadShards) {
      throw Error(
        "numWriteShards (" +
          this.numWriteShards +
          ") must be <= numReadShards (" +
          this.numReadShards +
          ")"
      );
    }

    this.islands = new Map(islands.map((island) => [island.no, island]));
    this.shards = new Map(
      range(0, numReadShards).map((no) => [
        no,
        new Shard(no, async () => {
          const islandsByShards = await this.islandsByShardsCached();
          return islandsByShards.get(no) || this.throwOnBadShardNo(no);
        }),
      ])
    );
  }

  prewarm() {
    for (const island of this.islands.values()) {
      island.master.prewarm();
      island.replicas.forEach((client) => client.prewarm());
    }
  }

  globalShard(): Shard<TClient> {
    return this.shards.get(0)!;
  }

  randomShard(): Shard<TClient> {
    // TODO: implement power-of-two algorithm to pick the shard smallest in size.
    const noFromOne = random(1, this.numWriteShards - 1);
    return this.shards.get(noFromOne)!;
  }

  shard(id: string): Shard<TClient> {
    const noMatterWhatIsland = [...this.islands.values()][0];
    if (!noMatterWhatIsland) {
      throw Error("The cluster has no islands");
    }

    const shardNo = noMatterWhatIsland.master.shardNoByID(id);
    const shard = this.shards.get(shardNo);
    if (!shard) {
      this.throwOnBadShardNo(shardNo);
    }

    return shard;
  }

  async islandShards(islandNo: number) {
    const islandsByShards = await this.islandsByShardsCached();
    return compact(
      [...islandsByShards.entries()].map(([shardNo, island]) =>
        island.no === islandNo ? this.shards.get(shardNo) : null
      )
    );
  }

  private async islandsByShardsCached() {
    if (this.islandsByShardsCache === undefined) {
      this.islandsByShardsCache = this.islandsByShardsExpensive();
      // Schedule re-discovery in background to refresh the cache in the future.
      setTimeout(() => {
        this.islandsByShardsCache = undefined;
        runInVoid(this.islandsByShardsCached());
      }, this.shardsRediscoverMs);
    }

    return this.islandsByShardsCache;
  }

  private async islandsByShardsExpensive(
    retriesLeft = DISCOVER_ERROR_RETRY_ATTEMPTS
  ): Promise<Map<number, Island<TClient>>> {
    try {
      const islandsByShard = new Map<number, Island<TClient>>();
      await mapJoin([...this.islands.values()], async (island) => {
        const shardNos = await island.master.shardNos();
        for (const shardNo of shardNos) {
          if (shardNo >= this.numReadShards) {
            continue;
          }

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
      return islandsByShard;
    } catch (e) {
      if (retriesLeft > 0) {
        await delay(DISCOVER_ERROR_RETRY_DELAY_MS);
        return this.islandsByShardsExpensive(retriesLeft - 1);
      } else {
        throw e;
      }
    }
  }

  throwOnBadShardNo(shardNo: number): never {
    const masterNames = [...this.islands.values()]
      .map((island) => island.master.name)
      .join(", ");
    if (shardNo >= this.numReadShards) {
      throw Error(`Shard ${shardNo} does not exist on [${masterNames}]`);
    } else {
      throw Error(
        `Shard ${shardNo} is not discoverable (DB down or connections limit?) on [${masterNames}]`
      );
    }
  }
}
