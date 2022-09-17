import Memoize from "../Memoize";
import type { Client } from "./Client";
import type { Island } from "./Cluster";
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
 * Shard is a numbered island with one master and N replicas.
 */
export class Shard<TClient extends Client> {
  constructor(
    public readonly no: number,
    private locateIsland: () => Promise<Island<TClient>>
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
    const { client, whyClient } = await this.clientEx(
      freshness ?? timeline,
      query.IS_WRITE ? true : undefined
    );
    const res = await query.run(client, { ...annotation, whyClient });

    if (query.IS_WRITE && freshness !== STALE_REPLICA) {
      timeline.setPos(
        await client.timelineManager.currentPos(),
        client.timelineManager.maxLagMs
      );
    }

    return res;
  }

  /**
   * Throws if this shard does not exist, or its island is down, or something
   * else is wrong with it.
   */
  async assertDiscoverable() {
    await this.locateIsland();
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
    const island = await this.locateIsland();
    const { master, replicas } = await this.clients(island);

    if (isWrite) {
      return { client: master, whyClient: "master-bc-is-write" };
    }

    if (timeline === MASTER) {
      return { client: master, whyClient: "master-bc-master-freshness" };
    }

    if (!replicas.length) {
      return { client: master, whyClient: "master-bc-no-replicas" };
    }

    const replica = replicas[Math.trunc(Math.random() * replicas.length)];

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
      ? { client: replica, whyClient: isCaughtUp }
      : { client: master, whyClient: "master-bc-replica-not-caught-up" };
  }

  /**
   * Returns all the clients within this shard. Memoized by island, so in case
   * the island changes, it will be re-calculated.
   */
  @Memoize()
  private async clients(islandForMemoize: Island<TClient>) {
    return {
      master: islandForMemoize.master.withShard(this.no),
      replicas: islandForMemoize.replicas.map((client) =>
        client.withShard(this.no)
      ),
    };
  }
}
