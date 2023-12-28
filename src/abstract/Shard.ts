import { hasKey, maybeCall } from "../helpers/misc";
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
 * Shard lives within an Island with one master and N replicas.
 */
export class Shard<TClient extends Client> {
  private shardClients = new WeakMap<TClient, TClient>();

  constructor(
    public readonly no: number,
    public readonly options: ShardOptions<TClient>
  ) {}

  /**
   * Chooses the right Client to be used for this Shard. We don't memoize,
   * because the Shard may relocate to another Island during re-discovery.
   */
  async client(
    timeline: Timeline | typeof MASTER | typeof STALE_REPLICA
  ): Promise<TClient> {
    for (let attempt = 0; ; attempt++) {
      try {
        const [client] = await this.clientImpl(timeline, undefined);
        return client;
      } catch (error: unknown) {
        if ((await this.options.onRunError(attempt, error)) === "retry") {
          continue;
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Runs a query after choosing the right Client (destination connection,
   * Shard, annotation etc.)
   */
  async run<TOutput>(
    query: Query<TOutput>,
    annotation: QueryAnnotation,
    timeline: Timeline,
    freshness: null | typeof MASTER | typeof STALE_REPLICA
  ): Promise<TOutput> {
    for (let attempt = 0; ; attempt++) {
      let client, whyClient, res;
      try {
        // Throws if e.g. we couldn't find an Island for this Shard.
        [client, whyClient] = await this.clientImpl(
          freshness ?? timeline,
          query.IS_WRITE ? true : undefined
        );
        // Throws if e.g. the Shard was there by the moment we got its client
        // above, but it probably disappeared (during migration) and appeared on
        // some other Island.
        res = await query.run(client, {
          ...annotation,
          whyClient,
          attempt: annotation.attempt + attempt,
        });
      } catch (error: unknown) {
        if (
          hasKey("stack", error) &&
          typeof error.stack === "string" &&
          attempt > 0
        ) {
          error.stack =
            error.stack.trimEnd() + `\n    after ${attempt + 1} attempts`;
        }

        if ((await this.options.onRunError(attempt, error)) === "retry") {
          continue;
        }

        throw error;
      }

      if (query.IS_WRITE && freshness !== STALE_REPLICA) {
        timeline.setPos(
          await client.timelineManager.currentPos(),
          maybeCall(client.timelineManager.maxLagMs)
        );
      }

      return res;
    }
  }

  /**
   * Throws if this Shard does not exist, or its Island is down, or something
   * else is wrong with it.
   */
  async assertDiscoverable(): Promise<void> {
    await this.client(MASTER);
  }

  /**
   * An extended Client selection logic. There are multiple reasons (8+ in total
   * so far) why a master or a replica may be chosen to send the query to. We
   * don't memoize, because the Shard may relocate to another Island during
   * re-discovery.
   */
  private async clientImpl(
    timeline: Timeline | typeof MASTER | typeof STALE_REPLICA,
    isWrite: true | undefined
  ): Promise<[client: TClient, whyClient: WhyClient]> {
    if (isWrite) {
      return [await this.shardClient(MASTER), "master-bc-is-write"];
    }

    if (timeline === MASTER) {
      return [await this.shardClient(MASTER), "master-bc-master-freshness"];
    }

    const replica = await this.shardClient(STALE_REPLICA);

    if (replica.isMaster()) {
      return [replica, "master-bc-no-replicas"];
    }

    if (timeline === STALE_REPLICA) {
      return [replica, "replica-bc-stale-replica-freshness"];
    }

    const isCaughtUp = timeline.isCaughtUp(
      await replica.timelineManager.currentPos()
    );
    return isCaughtUp
      ? [replica, isCaughtUp]
      : [await this.shardClient(MASTER), "master-bc-replica-not-caught-up"];
  }

  /**
   * Returns a Shard-aware Client of a particular freshness.
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
