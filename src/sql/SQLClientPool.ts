import defaults from "lodash/defaults";
import range from "lodash/range";
import type { Connection, PoolClient, PoolConfig } from "pg";
import { Pool } from "pg";
import type { ClientQueryLoggerProps } from "../abstract/Loggers";
import type { MaybeCallable } from "../helpers/misc";
import { maybeCall, runInVoid } from "../helpers/misc";
import type { SQLClientOptions } from "./SQLClient";
import { SQLClient } from "./SQLClient";

const DEFAULT_PREWARM_INTERVAL_MS = 10000;
const DEFAULT_MAX_CONN_LIFETIME_JITTER = 0.2;

let connNo = 1;

export interface SQLClientPoolOptions extends SQLClientOptions {
  config: PoolConfig;
  maxConnLifetimeMs?: number;
  maxConnLifetimeJitter?: number;
  prewarmIntervalMs?: number;
  prewarmQuery?: MaybeCallable<string>;
}

// Our extension to Pool connection which adds a couple props to the connection
// in on("connect") handler (persistent for the same connection objects, i.e.
// across queries in the same connection).
export type SQLClientPoolClient = PoolClient & {
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

  /** SQLClient configuration options. */
  override readonly options: Required<SQLClientPoolOptions>;

  protected async acquireConn(): Promise<PoolClient> {
    return this.state.pool.connect();
  }

  protected releaseConn(conn: SQLClientPoolClient): void {
    const needClose = !!(conn.closeAt && Date.now() > conn.closeAt);
    conn.release(needClose);
  }

  protected poolStats(): ClientQueryLoggerProps["poolStats"] {
    return {
      totalCount: this.state.pool.totalCount,
      waitingCount: this.state.pool.waitingCount,
      idleCount: this.state.pool.idleCount,
    };
  }

  constructor(options: SQLClientPoolOptions) {
    super(options);
    this.options = defaults({}, (this as SQLClient).options, {
      config: options.config,
      maxConnLifetimeMs: 0,
      maxConnLifetimeJitter: DEFAULT_MAX_CONN_LIFETIME_JITTER,
      prewarmIntervalMs: DEFAULT_PREWARM_INTERVAL_MS,
      prewarmQuery: () => {
        // This may be slow: full-text dictionaries initialization is slow, and
        // also the 1st query in a pg-pool connection is slow.
        const tokens = `word ${Math.floor(Date.now() / 1000)}`;
        return `SELECT 'word' @@ plainto_tsquery('english', '${tokens}')`;
      },
    });

    this.state = {
      pool: new Pool(this.options.config)
        .on("connect", (client: SQLClientPoolClient) => {
          this.state.clients.add(client);
          client.id = connNo++;
          client.closeAt =
            this.options.maxConnLifetimeMs > 0
              ? Date.now() +
                this.options.maxConnLifetimeMs *
                  (1 +
                    (this.options.maxConnLifetimeJitter ??
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
          this.logSwallowedError('Pool.on("error")', e, null);
        }),
      clients: new Set(),
      prewarmTimeout: null,
      ended: false,
    };
  }

  override logSwallowedError(
    where: string,
    e: unknown,
    elapsed: number | null
  ): void {
    if (!this.state.ended) {
      super.logSwallowedError(where, e, elapsed);
    }
  }

  override async end(forceDisconnect?: boolean): Promise<void> {
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

  override prewarm(): void {
    if (!this.options.config.min) {
      return;
    }

    const toPrewarm = this.options.config.min - this.state.pool.waitingCount;
    if (toPrewarm > 0) {
      const startTime = performance.now();
      range(toPrewarm).forEach(() =>
        runInVoid(
          this.state.pool
            .query(maybeCall(this.options.prewarmQuery))
            .catch((error) =>
              this.logSwallowedError(
                "prewarm()",
                error,
                performance.now() - startTime
              )
            )
        )
      );
    }

    this.state.prewarmTimeout && clearTimeout(this.state.prewarmTimeout);
    this.state.prewarmTimeout = setTimeout(
      () => this.prewarm(),
      this.options.prewarmIntervalMs
    );
  }
}
