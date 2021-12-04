/**
 * A side effect based container which holds the current master or replica
 * session position. For master, the expectation is that the pos will be updated
 * after each query only, so no need to use refreshMs. For replica, it's also
 * updated after each query PLUS the class will call triggerRefresh() hook not
 * more often than every refreshMs interval.
 */
export class SessionPosManager {
  private pos = BigInt(0);
  private hrtime = BigInt(0);
  private triggerRefreshPromise: Promise<unknown> | null = null;

  constructor(
    /** Up to how often we call triggerRefresh(). */
    private refreshMs: number | null,
    /** For replica island client, this method is called time to time to refresh
     * the data which is later returned by currentPos(). Makes sense for
     * connections which execute queries rarely: for them, the framework
     * triggers the update when the fresh data is needed. */
    private triggerRefresh: () => Promise<unknown>
  ) {}

  /**
   * Returns the current Client's replication session position (e.g. WAL
   * position).
   */
  async currentPos(): Promise<bigint> {
    if (
      this.refreshMs !== null &&
      this.hrtime <
        process.hrtime.bigint() - BigInt(this.refreshMs) * BigInt(1e6)
    ) {
      // Outdates pos; refresh it with coalescing multiple requests.
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
   * Sets the actual session pos. Must be called by the client after each
   * interaction with the database.
   */
  setCurrentPos(pos: bigint) {
    this.pos = pos > this.pos ? pos : this.pos;
    this.hrtime = process.hrtime.bigint();
  }
}
