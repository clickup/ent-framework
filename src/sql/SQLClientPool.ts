import defaults from "lodash/defaults";
import range from "lodash/range";
import type { Connection, PoolClient, PoolConfig } from "pg";
import { Pool } from "pg";
import type { ClientQueryLoggerProps } from "../abstract/Loggers";
import type { MaybeCallable, PickPartial } from "../helpers/misc";
import { maybeCall, runInVoid } from "../helpers/misc";
import type { SQLClientOptions } from "./SQLClient";
import { SQLClient } from "./SQLClient";

/**
 * Options for SQLClientPool constructor.
 */
export interface SQLClientPoolOptions extends SQLClientOptions {
  config: PoolConfig;
  maxConnLifetimeMs?: number;
  maxConnLifetimeJitter?: number;
  prewarmIntervalMs?: number;
  prewarmQuery?: MaybeCallable<string>;
}

/**
 * Our extension to Pool connection which adds a couple props to the connection
 * in on("connect") handler (persistent for the same connection objects, i.e.
 * across queries in the same connection).
 */
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
  /** Default values for the constructor options. */
  static override readonly DEFAULT_OPTIONS: Required<
    PickPartial<SQLClientPoolOptions>
  > = {
    ...super.DEFAULT_OPTIONS,
    maxConnLifetimeMs: 0,
    maxConnLifetimeJitter: 0.2,
    prewarmIntervalMs: 10000,
    prewarmQuery: 'SELECT 1 AS "prewarmQuery"',
  };

  /** Client.withShard() clones `this`, so we must put all of the primitive
   * typed props to a separate object to make them shareable across all of the
   * clones. (Another option would be to introduce a proxy, but it's an
   * overkill.) */
  private state: {
    pool: Pool;
    clients: Set<PoolClient>;
    prewarmTimeout: NodeJS.Timeout | null;
    ended: boolean;
  };

  /** SQLClientPool configuration options. */
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
    this.options = defaults(
      {},
      options,
      (this as SQLClient).options,
      SQLClientPool.DEFAULT_OPTIONS
    );

    this.state = {
      pool: new Pool(this.options.config)
        .on("connect", (client: SQLClientPoolClient) => {
          this.state.clients.add(client);
          client.id = connNo++;
          client.closeAt =
            this.options.maxConnLifetimeMs > 0
              ? Date.now() +
                this.options.maxConnLifetimeMs *
                  (1 + this.options.maxConnLifetimeJitter * Math.random())
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

  async end(forceDisconnect?: boolean): Promise<void> {
    if (this.state.ended) {
      return;
    }

    this.state.ended = true;
    this.state.prewarmTimeout && clearTimeout(this.state.prewarmTimeout);
    this.state.prewarmTimeout = null;

    if (forceDisconnect) {
      for (const client of this.state.clients) {
        const connection: Connection = (client as any).connection;
        connection.stream.destroy();
      }
    } else {
      return this.state.pool.end();
    }
  }

  isEnded(): boolean {
    return this.state.ended;
  }

  override prewarm(): void {
    if (this.state.prewarmTimeout) {
      // Already scheduled a prewarm, so skipping.
      return;
    }

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
                `${this.constructor.name}.prewarm`,
                error,
                performance.now() - startTime
              )
            )
        )
      );
    }

    this.state.prewarmTimeout && clearTimeout(this.state.prewarmTimeout);
    this.state.prewarmTimeout = setTimeout(() => {
      this.state.prewarmTimeout = null;
      this.prewarm();
    }, this.options.prewarmIntervalMs);
  }
}

let connNo = 1;
