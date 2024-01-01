import defaults from "lodash/defaults";
import range from "lodash/range";
import type { Connection, PoolClient, PoolConfig } from "pg";
import { Pool } from "pg";
import type { ClientQueryLoggerProps } from "../abstract/Loggers";
import type { MaybeCallable, PickPartial } from "../helpers/misc";
import { maybeCall, runInVoid } from "../helpers/misc";
import { Ref } from "../helpers/Ref";
import type { SQLClientConn, SQLClientOptions } from "./SQLClient";
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
export type SQLClientPoolConn = SQLClientConn & {
  /** Implemented but not documented property, see:
   * https://github.com/brianc/node-postgres/issues/2665 */
  processID?: number | null;
  /** Assigned manually in addition to PoolClient props. */
  closeAt?: number;
};

/**
 * This class carries connection pooling logic only and delegates the rest to
 * SQLClient base class.
 *
 * The idea is that in each particular project, people may have they own classes
 * derived from SQLClient, in case the codebase already has some existing
 * connection pooling solution. They don't have to use SQLClientPool.
 */
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

  /** PG connection pool to use. */
  private readonly pool: Pool;

  /** All open PG client connections. */
  private readonly clients = new Set<SQLClientPoolConn>();

  /** Prewarming periodic timer (if scheduled). */
  private readonly prewarmTimeout = new Ref<NodeJS.Timeout | null>(null);

  /** Whether the pool has been ended and is not usable anymore. */
  private readonly ended = new Ref(false);

  /** SQLClientPool configuration options. */
  override readonly options: Required<SQLClientPoolOptions>;

  protected async acquireConn(): Promise<SQLClientPoolConn> {
    return this.pool.connect();
  }

  protected releaseConn(conn: SQLClientPoolConn): void {
    const needClose = !!(conn.closeAt && Date.now() > conn.closeAt);
    conn.release(needClose);
  }

  protected poolStats(): ClientQueryLoggerProps["poolStats"] {
    return {
      totalCount: this.pool.totalCount,
      waitingCount: this.pool.waitingCount,
      idleCount: this.pool.idleCount,
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

    this.pool = new Pool(this.options.config)
      .on("connect", (client: SQLClientPoolConn & PoolClient) => {
        this.clients.add(client);
        client.id = connNo++;
        client.closeAt =
          this.options.maxConnLifetimeMs > 0
            ? Date.now() +
              this.options.maxConnLifetimeMs *
                (1 + this.options.maxConnLifetimeJitter * Math.random())
            : undefined;
        // Sets a "default error" handler to not let forceDisconnect errors leak
        // to e.g. Jest and the outside world as "unhandled error". Appending an
        // additional error handler to EventEmitter doesn't affect the existing
        // error handlers anyhow, so should be safe.
        client.on("error", () => {});
      })
      .on("remove", (conn) => this.clients.delete(conn))
      .on("error", (e) =>
        // Having this hook prevents node from crashing.
        this.logSwallowedError('Pool.on("error")', e, null)
      );
  }

  override logSwallowedError(
    where: string,
    e: unknown,
    elapsed: number | null
  ): void {
    if (!this.ended.current) {
      super.logSwallowedError(where, e, elapsed);
    }
  }

  async end(): Promise<void> {
    if (this.ended.current) {
      return;
    }

    this.ended.current = true;
    this.prewarmTimeout.current && clearTimeout(this.prewarmTimeout.current);
    this.prewarmTimeout.current = null;
    return this.pool.end();
  }

  forceDisconnect(): void {
    for (const client of this.clients) {
      const connection: Connection = (client as any).connection;
      connection.stream.destroy();
    }
  }

  isEnded(): boolean {
    return this.ended.current;
  }

  override prewarm(): void {
    if (this.prewarmTimeout.current) {
      // Already scheduled a prewarm, so skipping.
      return;
    }

    if (!this.options.config.min) {
      return;
    }

    const toPrewarm = this.options.config.min - this.pool.waitingCount;
    if (toPrewarm > 0) {
      const startTime = performance.now();
      range(toPrewarm).forEach(() =>
        runInVoid(
          this.pool
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

    this.prewarmTimeout.current = setTimeout(() => {
      this.prewarmTimeout.current = null;
      this.prewarm();
    }, this.options.prewarmIntervalMs);
  }
}

let connNo = 1;
