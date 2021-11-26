import Memoize from "../Memoize";
import { Client } from "./Client";
import { Island } from "./Cluster";
import { Query } from "./Query";
import { QueryAnnotation } from "./QueryAnnotation";
import { Session } from "./Session";

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

  async client(
    session: Session | typeof MASTER | typeof STALE_REPLICA
  ): Promise<TClient> {
    const { master, replicas } = await this.clients();
    if (session === MASTER || !replicas.length) {
      return master;
    }

    const replica = replicas[Math.trunc(Math.random() * replicas.length)];
    return session === STALE_REPLICA || session.isCaughtUp(replica.sessionPos())
      ? replica
      : master;
  }

  async run<TOutput>(
    query: Query<TOutput>,
    annotation: QueryAnnotation,
    session: Session,
    origFreshness: null | typeof MASTER | typeof STALE_REPLICA
  ): Promise<TOutput> {
    const freshness = query.IS_WRITE ? MASTER : origFreshness;
    const client = await this.client(freshness ?? session);
    const res = await query.run(client, annotation);

    if (query.IS_WRITE && origFreshness !== STALE_REPLICA) {
      session.setPos(client.sessionPos());
    }

    return res;
  }

  @Memoize()
  private async clients() {
    const island = await this.locateIsland();
    return {
      master: island.master.withShard(this.no),
      replicas: island.replicas.map((client) => client.withShard(this.no)),
    };
  }
}
