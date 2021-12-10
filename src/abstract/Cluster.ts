import random from "lodash/random";
import range from "lodash/range";
import { mapJoin, runInVoid } from "../helpers";
import { Client } from "./Client";
import { Shard } from "./Shard";

/**
 * Island is 1 master + N replicas.
 * One island typically hosts multiple shards.
 */
export class Island<TClient extends Client> {
  constructor(
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
  readonly shards: ReadonlyArray<Shard<TClient>>;
  private islandsByShardsCache: Promise<Array<Island<TClient>>> | undefined;

  constructor(
    public readonly numReadShards: number,
    public readonly numWriteShards: number,
    public readonly islands: ReadonlyMap<number, Island<TClient>>,
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

    this.shards = range(0, numReadShards).map(
      (no) =>
        new Shard(no, async () => {
          const islandsByShards = await this.islandsByShardsCached();
          return islandsByShards[no] || this.throwOnBadShardNo(no);
        })
    );
  }

  prewarm() {
    for (const island of this.islands.values()) {
      island.master.prewarm();
      island.replicas.forEach((client) => client.prewarm());
    }
  }

  globalShard(): Shard<TClient> {
    return this.shards[0];
  }

  randomShard(): Shard<TClient> {
    // TODO: implement power-of-two algorithm to pick the smallest in size shard.
    const noFromOne = random(1, this.numWriteShards - 1);
    return this.shards[noFromOne];
  }

  shard(id: string): Shard<TClient> {
    const noMatterWhatIsland = [...this.islands.values()][0];
    if (!noMatterWhatIsland) {
      throw Error("The cluster has no islands");
    }

    const shardNo = noMatterWhatIsland.master.shardNoByID(id);
    const shard = this.shards[shardNo];
    if (!shard) {
      this.throwOnBadShardNo(shardNo);
    }

    return shard;
  }

  private async islandsByShardsCached() {
    if (this.islandsByShardsCache === undefined) {
      this.islandsByShardsCache = (async () => {
        const islandsByShard: Array<Island<TClient>> = [];
        await mapJoin([...this.islands.values()], async (island) => {
          const shardNos = await island.master.shardNos();
          for (const shardNo of shardNos) {
            if (shardNo >= this.numReadShards) {
              continue;
            }

            if (islandsByShard[shardNo]) {
              throw Error(
                "Shard #" +
                  shardNo +
                  " exists in more than one islands (" +
                  island.master.name +
                  " and " +
                  islandsByShard[shardNo].master.name +
                  ")"
              );
            }

            islandsByShard[shardNo] = island;
          }
        });
        return islandsByShard;
      })();

      // Schedule re-discovery in background to refresh the cache in the future.
      setTimeout(() => {
        this.islandsByShardsCache = undefined;
        runInVoid(this.islandsByShardsCached());
      }, this.shardsRediscoverMs);
    }

    return this.islandsByShardsCache;
  }

  throwOnBadShardNo(shardNo: number): never {
    if (shardNo >= this.numReadShards) {
      throw Error(`Shard ${shardNo} does not exist`);
    } else {
      throw Error(`Shard ${shardNo} is not discoverable (DB down?)`);
    }
  }
}
