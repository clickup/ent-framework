import type { Client } from "./Client";
import type { Query } from "./Query";
import type { QueryAnnotation, WhyClient } from "./QueryAnnotation";
import type { Timeline } from "./Timeline";

/**
 * Master freshness: reads always go to master.
 */
export const MASTER = Symbol("MASTER");

/**
 * Stale replica freshness: reads always go to a replica, even if it's stale.
 */
export const STALE_REPLICA = Symbol("STALE_REPLICA");

/**
 * Options passed to Shard constructor.
 */
export interface ShardOptions<TClient extends Client> {
  locateClient: (
    freshness: typeof MASTER | typeof STALE_REPLICA
  ) => Promise<TClient>;
  onRunError: (attempt: number, error: unknown) => Promise<"retry" | "throw">;
}

/**
 * Shard is a numbered island with one master and N replicas.
 */
export class Shard<TClient extends Client> {
  private shardClients = new WeakMap<TClient, TClient>();

  constructor(
    public readonly no: number,
    private options: ShardOptions<TClient>
  ) {}

  /**
   * Chooses the right client to be used for this shard. We don't memoize,
   * because the Shard may relocate to another Island during re-discovery.
   */
  async client(
    timeline: Timeline | typeof MASTER | typeof STALE_REPLICA
  ): Promise<TClient> {
    const { client } = await this.clientEx(timeline, undefined);
    return client;
  }

  /**
   * Runs a query after choosing the right client (destination connection,
   * shard, annotation etc.)
   */
  async run<TOutput>(
    query: Query<TOutput>,
    annotation: QueryAnnotation,
    timeline: Timeline,
    freshness: null | typeof MASTER | typeof STALE_REPLICA
  ): Promise<TOutput> {
    for (let attempt = 0; ; attempt++) {
      const { client, whyClient } = await this.clientEx(
        freshness ?? timeline,
        query.IS_WRITE ? true : undefined
      );

      let res;
      try {
        res = await query.run(client, {
          ...annotation,
          whyClient,
          attempt: annotation.attempt + attempt,
        });
      } catch (error: unknown) {
        // The shard was there by the moment we got its client, but it probably
        // disappeared (during migration) and appeared on some other island.
        if ((await this.options.onRunError(attempt, error)) === "retry") {
          continue;
        } else {
          throw error;
        }
      }

      if (query.IS_WRITE && freshness !== STALE_REPLICA) {
        timeline.setPos(
          await client.timelineManager.currentPos(),
          client.timelineManager.maxLagMs
        );
      }

      return res;
    }
  }

  /**
   * Throws if this shard does not exist, or its island is down, or something
   * else is wrong with it.
   */
  async assertDiscoverable(): Promise<void> {
    await this.options.locateClient(MASTER);
  }

  /**
   * An extended client selection logic. There are multiple reasons (8+ in total
   * so far) why a master or a replica may be chosen to send the query to. We
   * don't memoize, because the Shard may relocate to another Island during
   * re-discovery.
   */
  private async clientEx(
    timeline: Timeline | typeof MASTER | typeof STALE_REPLICA,
    isWrite: true | undefined
  ): Promise<{ client: TClient; whyClient: WhyClient }> {
    if (isWrite) {
      return {
        client: await this.shardClient(MASTER),
        whyClient: "master-bc-is-write",
      };
    }

    if (timeline === MASTER) {
      return {
        client: await this.shardClient(MASTER),
        whyClient: "master-bc-master-freshness",
      };
    }

    const replica = await this.shardClient(STALE_REPLICA);

    if (replica.isMaster) {
      return {
        client: replica,
        whyClient: "master-bc-no-replicas",
      };
    }

    if (timeline === STALE_REPLICA) {
      return {
        client: replica,
        whyClient: "replica-bc-stale-replica-freshness",
      };
    }

    const isCaughtUp = timeline.isCaughtUp(
      await replica.timelineManager.currentPos()
    );
    return isCaughtUp
      ? {
          client: replica,
          whyClient: isCaughtUp,
        }
      : {
          client: await this.shardClient(MASTER),
          whyClient: "master-bc-replica-not-caught-up",
        };
  }

  /**
   * Returns a shard-aware Client of a particular freshness.
   */
  private async shardClient(
    freshness: typeof MASTER | typeof STALE_REPLICA
  ): Promise<TClient> {
    const client = await this.options.locateClient(freshness);
    let shardClient = this.shardClients.get(client);
    if (!shardClient) {
      shardClient = client.withShard(this.no);
      this.shardClients.set(client, shardClient);
    }

    return shardClient;
  }
}
