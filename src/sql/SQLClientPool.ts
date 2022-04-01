import { Pool, PoolClient, PoolConfig } from "pg";
import { Loggers } from "../abstract/Client";
import { runInVoid } from "../helpers";
import { SQLClient } from "./SQLClient";

const DEFAULT_PREWARM_INTERVAL_MS = 10000;
const DEFAULT_MAX_CONN_LIFETIME_JITTER = 0.2;

let connNo = 1;

export interface SQLClientDest {
  name: string;
  shards: {
    nameFormat: string;
    discoverQuery: string;
  };
  isMaster: boolean;
  config: PoolConfig & {
    maxConnLifetimeMs?: number;
    maxConnLifetimeJitter?: number;
    maxReplicationLagMs?: number;
    prewarmIntervalMs?: number;
  };
}

// Our extension to Pool connection which adds a couple props to the connection
// in on("connect") handler (persistent for the same connection objects, i.e.
// across queries in the same connection).
type SQLClientPoolConn = PoolClient & {
  /** Implemented but not documented property, see:
   * https://github.com/brianc/node-postgres/issues/2665 */
  processID?: number | null;
  /** Assigned manually in addition to PoolClient props. */
  id?: number;
  /** Assigned manually in addition to PoolClient props. */
  closeAt?: number;
};

export class SQLClientPool extends SQLClient {
  private pool: Pool;

  constructor(public readonly dest: SQLClientDest, loggers: Loggers) {
    super(
      dest.name,
      dest.isMaster,
      loggers,
      dest.shards,
      dest.config.maxReplicationLagMs
    );

    this.pool = new Pool(dest.config)
      .on("connect", (conn: SQLClientPoolConn) => {
        conn.id = connNo++;
        conn.closeAt = dest.config.maxConnLifetimeMs
          ? Date.now() +
            dest.config.maxConnLifetimeMs *
              (1 +
                (dest.config.maxConnLifetimeJitter ??
                  DEFAULT_MAX_CONN_LIFETIME_JITTER) *
                  Math.random())
          : undefined;
      })
      .on("error", (e) => {
        // Having this hook prevents node from crashing.
        this.logGlobalError("SQLClientPool", e);
      });
  }

  protected async acquireConn() {
    return this.pool.connect();
  }

  protected releaseConn(conn: SQLClientPoolConn) {
    const needClose = !!(conn.closeAt && Date.now() > conn.closeAt);
    conn.release(needClose);
  }

  override prewarm() {
    if (!this.dest.config.min) {
      return;
    }

    const toPrewarm = this.dest.config.min - this.pool.waitingCount;
    if (toPrewarm > 0) {
      Array.from(Array(toPrewarm).keys()).forEach(
        // This may be slow: full-text dictionaries initialization is slow, and
        // also the 1st query in a pg-pool connection is slow.
        () =>
          runInVoid(
            this.pool
              .query("SELECT 'word' @@ plainto_tsquery('english', 'word')")
              .catch((e) => this.logGlobalError("SQLClientPool prewarm", e))
          )
      );
    }

    setTimeout(
      () => this.prewarm(),
      this.dest.config.prewarmIntervalMs ?? DEFAULT_PREWARM_INTERVAL_MS
    );
  }
}
