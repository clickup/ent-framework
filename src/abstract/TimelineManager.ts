/**
 * A side effect based container which holds the current master or replica
 * timeline position. For master, the expectation is that the pos will be
 * updated after each query only, so no need to use refreshMs. For replica, it's
 * also updated after each query PLUS the class will call triggerRefresh() hook
 * not more often than every refreshMs interval.
 */
export class TimelineManager {
  private pos = BigInt(0);
  private hrtimeOfChange = BigInt(0);
  private triggerRefreshPromise: Promise<unknown> | null = null;

  constructor(
    /** Time interval after which a replica is declared as "caught up" even if
     * it's not caught up. This is to not read from master forever when
     * something has happened with the replica. */
    public readonly maxLagMs: number,
    /** Up to how often we call triggerRefresh(). */
    private refreshMs: number | null,
    /** For replica Island Client, this method is called time to time to refresh
     * the data which is later returned by currentPos(). Makes sense for
     * connections which execute queries rarely: for them, the framework
     * triggers the update when the fresh data is needed. */
    private triggerRefresh: () => Promise<unknown>
  ) {}

  /**
   * Returns the current Client's replication timeline position (e.g. WAL
   * position).
   */
  async currentPos(): Promise<bigint> {
    if (
      this.refreshMs !== null &&
      process.hrtime.bigint() >
        this.hrtimeOfChange + BigInt(this.refreshMs) * BigInt(1e6)
    ) {
      // Outdated pos; refresh it, also coalesce concurrent requests if any.
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
  setCurrentPos(pos: bigint): void {
    this.pos = pos > this.pos ? pos : this.pos;
    this.hrtimeOfChange = process.hrtime.bigint();
  }
}
