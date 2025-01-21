import { maybeCall, type MaybeCallable } from "../internal/misc";

/**
 * A side effect based container which holds the current master or replica
 * timeline position. For master, the expectation is that the pos will be
 * updated after each query only, so no need to use refreshMs. For replica, it's
 * also updated after each query PLUS the class will call triggerRefresh() hook
 * not more often than every refreshMs interval.
 */
export class TimelineManager {
  private pos = BigInt(0);
  private changeTime = 0;
  private triggerRefreshPromise: Promise<unknown> | null = null;

  constructor(
    /** Time interval after which a replica is declared as "caught up" even if
     * it's not caught up. This is to not read from master forever when
     * something has happened with the replica. */
    public readonly maxLagMs: MaybeCallable<number>,
    /** Up to how often we call triggerRefresh(). */
    private refreshMs: MaybeCallable<number>,
    /** This method is called time to time to refresh the data which is later
     * returned by currentPos(). Makes sense for replica connections which
     * execute queries rarely: for them, the framework triggers the update when
     * the fresh data is needed. */
    private triggerRefresh: () => Promise<unknown>,
  ) {}

  /**
   * Returns the current Client's replication timeline position (e.g. WAL
   * position).
   */
  async currentPos(): Promise<bigint> {
    const refreshMs = maybeCall(this.refreshMs);
    if (performance.now() > this.changeTime + refreshMs) {
      // Outdated pos; refresh it, also coalesce concurrent requests if any.
      // Notice that we run this logic not only for replicas, but for masters
      // too, because we can't distinguish the server role at this place. It's
      // not a big deal and results into just one extra query within refreshMs
      // time interval (which is typically ~1 second).
      try {
        this.triggerRefreshPromise ??= this.triggerRefresh();
        await this.triggerRefreshPromise;
      } finally {
        this.triggerRefreshPromise = null;
      }
    }

    return this.pos;
  }

  /**
   * Sets the actual timeline pos. Must be called by the Client after each
   * interaction with the database.
   */
  setCurrentPos(pos: bigint, force?: boolean): void {
    this.pos = pos > this.pos || force ? pos : this.pos;
    this.changeTime = performance.now();
  }
}
