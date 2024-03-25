import { maybeCall } from "../internal/misc";
import { type Client } from "./Client";
import type { Island } from "./Island";
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
 * Shard lives within an Island with one master and N replicas.
 */
export class Shard<TClient extends Client> {
  private shardClients = new WeakMap<TClient, TClient>();

  constructor(
    /** Shard number. */
    public readonly no: number,
    /** A middleware to wrap queries with. It's responsible for locating the
     * right Island and retrying the call to body() (i.e. failed queries) in
     * case e.g. a shard is moved to another Island. */
    public readonly runWithLocatedIsland: <TRes>(
      body: (island: Island<TClient>, attempt: number) => Promise<TRes>,
    ) => Promise<TRes>,
  ) {}

  /**
   * Chooses the right Client to be used for this Shard. We don't memoize,
   * because the Shard may relocate to another Island during re-discovery.
   */
  async client(
    timeline: Timeline | typeof MASTER | typeof STALE_REPLICA,
  ): Promise<TClient> {
    const [client] = await this.runWithLocatedIsland(async (island) =>
      this.clientImpl(island, timeline, undefined),
    );
    return client;
  }

  /**
   * Runs a query after choosing the right Client (destination connection,
   * Shard, annotation etc.)
   */
  async run<TOutput>(
    query: Query<TOutput>,
    annotation: QueryAnnotation,
    timeline: Timeline,
    freshness: null | typeof MASTER | typeof STALE_REPLICA,
  ): Promise<TOutput> {
    return this.runWithLocatedIsland(async (island, attempt) => {
      const [client, whyClient] = await this.clientImpl(
        island,
        freshness ?? timeline,
        query.IS_WRITE ? true : undefined,
      );

      // Throws if e.g. the Shard was there by the moment we got its client
      // above, but it probably disappeared (during migration) and appeared on
      // some other Island.
      const res = await query.run(client, {
        ...annotation,
        whyClient,
        attempt: annotation.attempt + attempt,
      });

      if (query.IS_WRITE && freshness !== STALE_REPLICA) {
        timeline.setPos(
          await client.timelineManager.currentPos(),
          maybeCall(client.timelineManager.maxLagMs),
        );
      }

      return res;
    });
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
   * don't @Memoize, because the Shard may relocate to another Island during
   * re-discovery, so we have to run this logic every time.
   */
  private async clientImpl(
    island: Island<TClient>,
    timeline: Timeline | typeof MASTER | typeof STALE_REPLICA,
    isWrite: true | undefined,
  ): Promise<[client: TClient, whyClient: WhyClient]> {
    if (isWrite) {
      return [this.withShard(island.master()), "master-bc-is-write"];
    }

    if (timeline === MASTER) {
      return [this.withShard(island.master()), "master-bc-master-freshness"];
    }

    const replica = island.replica();

    if (replica.role() !== "replica") {
      return [this.withShard(replica), "master-bc-no-replicas"];
    }

    if (timeline === STALE_REPLICA) {
      return [this.withShard(replica), "replica-bc-stale-replica-freshness"];
    }

    const isCaughtUp = timeline.isCaughtUp(
      await replica.timelineManager.currentPos(),
    );
    return isCaughtUp
      ? [this.withShard(replica), isCaughtUp]
      : [this.withShard(island.master()), "master-bc-replica-not-caught-up"];
  }

  /**
   * Returns a Shard-aware Client from an Island Client.
   */
  private withShard(client: TClient): TClient {
    let shardClient = this.shardClients.get(client);
    if (!shardClient) {
      shardClient = client.withShard(this.no);
      this.shardClients.set(client, shardClient);
    }

    return shardClient;
  }
}
