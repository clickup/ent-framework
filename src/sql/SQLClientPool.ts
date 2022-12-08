import type { Connection, PoolClient, PoolConfig } from "pg";
import { Pool } from "pg";
import type { Loggers } from "../abstract/Client";
import { runInVoid } from "../helpers/misc";
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
  hints?: Record<string, string>;
  batchDelayMs?: number | (() => number);
  config: PoolConfig & {
    maxConnLifetimeMs?: number;
    maxConnLifetimeJitter?: number;
    maxReplicationLagMs?: number;
    prewarmIntervalMs?: number;
    prewarmQuery?: string | (() => string);
  };
}

// Our extension to Pool connection which adds a couple props to the connection
// in on("connect") handler (persistent for the same connection objects, i.e.
// across queries in the same connection).
type SQLClientPoolClient = PoolClient & {
  /** Implemented but not documented property, see:
   * https://github.com/brianc/node-postgres/issues/2665 */
  processID?: number | null;
  /** Assigned manually in addition to PoolClient props. */
  id?: number;
  /** Assigned manually in addition to PoolClient props. */
  closeAt?: number;
};

export class SQLClientPool extends SQLClient {
  // Client.withShard() clones `this`, so we must put all of the primitive typed
  // props to a separate object to make them shareable across all of the clones.
  // (Another option would be to introduce a proxy, but it's an overkill.)
  private state: {
    pool: Pool;
    clients: Set<PoolClient>;
    prewarmTimeout: NodeJS.Timeout | null;
    ended: boolean;
  };

  protected override logGlobalError(where: string, e: unknown) {
    if (!this.state.ended) {
      super.logGlobalError(where, e);
    }
  }

  protected async acquireConn() {
    return this.state.pool.connect();
  }

  protected releaseConn(conn: SQLClientPoolClient) {
    const needClose = !!(conn.closeAt && Date.now() > conn.closeAt);
    conn.release(needClose);
  }

  constructor(public readonly dest: SQLClientDest, loggers: Loggers) {
    super(
      dest.name,
      dest.isMaster,
      loggers,
      dest.hints,
      dest.shards,
      dest.config.maxReplicationLagMs,
      dest.batchDelayMs
    );

    this.state = {
      pool: new Pool(dest.config)
        .on("connect", (client: SQLClientPoolClient) => {
          this.state.clients.add(client);
          client.id = connNo++;
          client.closeAt = dest.config.maxConnLifetimeMs
            ? Date.now() +
              dest.config.maxConnLifetimeMs *
                (1 +
                  (dest.config.maxConnLifetimeJitter ??
                    DEFAULT_MAX_CONN_LIFETIME_JITTER) *
                    Math.random())
            : undefined;
          // Sets a "default error" handler to not let forceDisconnect errors
          // leak to e.g. Jest and the outside world as "unhandled error".
          // Appending an additional error handler to EventEmitter doesn't
          // affect the existing error handlers anyhow, so should be safe.
          client.on("error", () => {});
        })
        .on("remove", (conn) => {
          this.state.clients.delete(conn);
        })
        .on("error", (e) => {
          // Having this hook prevents node from crashing.
          this.logGlobalError("SQLClientPool", e);
        }),
      clients: new Set(),
      prewarmTimeout: null,
      ended: false,
    };
  }

  override async end(forceDisconnect?: boolean) {
    if (this.state.ended) {
      return;
    }

    this.state.ended = true;
    this.state.prewarmTimeout && clearTimeout(this.state.prewarmTimeout);
    if (forceDisconnect) {
      for (const client of this.state.clients) {
        const connection: Connection = (client as any).connection;
        connection.stream.destroy();
      }
    } else {
      return this.state.pool.end();
    }
  }

  override prewarm() {
    if (!this.dest.config.min) {
      return;
    }

    const toPrewarm = this.dest.config.min - this.state.pool.waitingCount;
    if (toPrewarm > 0) {
      const prewarmQuery =
        this.dest.config.prewarmQuery ??
        (() => {
          // This may be slow: full-text dictionaries initialization is slow,
          // and also the 1st query in a pg-pool connection is slow.
          const tokens = `word ${Math.floor(Date.now() / 1000)}`;
          return `SELECT 'word' @@ plainto_tsquery('english', '${tokens}')`;
        });
      const query =
        typeof prewarmQuery === "string" ? prewarmQuery : prewarmQuery();
      Array.from(Array(toPrewarm).keys()).forEach(() =>
        runInVoid(
          this.state.pool
            .query(query)
            .catch((e) => this.logGlobalError("SQLClientPool.prewarm()", e))
        )
      );
    }

    this.state.prewarmTimeout && clearTimeout(this.state.prewarmTimeout);
    this.state.prewarmTimeout = setTimeout(
      () => this.prewarm(),
      this.dest.config.prewarmIntervalMs ?? DEFAULT_PREWARM_INTERVAL_MS
    );
  }
}
