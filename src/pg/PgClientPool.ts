import defaults from "lodash/defaults";
import range from "lodash/range";
import type { PoolClient, PoolConfig } from "pg";
import { Pool } from "pg";
import type {
  ClientQueryLoggerProps,
  SwallowedErrorLoggerProps,
} from "../abstract/Loggers";
import type { MaybeCallable, PickPartial } from "../internal/misc";
import { jitter, maybeCall, runInVoid } from "../internal/misc";
import { Ref } from "../internal/Ref";
import type { PgClientConn, PgClientOptions } from "./PgClient";
import { PgClient } from "./PgClient";

/**
 * Options for PgClientPool constructor.
 */
export interface PgClientPoolOptions extends PgClientOptions {
  /** Node-Postgres config. We can't make it MaybeCallable unfortunately,
   * because it's used to initialize Node-Postgres Pool. */
  config: PoolConfig;
  /** Close the connection after the query if it was opened long time ago. */
  maxConnLifetimeMs?: MaybeCallable<number>;
  /** Jitter for old connections closure. */
  maxConnLifetimeJitter?: MaybeCallable<number>;
  /** How often to send bursts of prewarm queries to all Clients to keep the
   * minimal number of open connections. */
  prewarmIntervalMs?: MaybeCallable<number>;
  /** What prewarm query to send. */
  prewarmQuery?: MaybeCallable<string>;
}

/**
 * Our extension to Pool connection which adds a couple props to the connection
 * in on("connect") handler (persistent for the same connection objects, i.e.
 * across queries in the same connection).
 */
export type PgClientPoolConn = PgClientConn & {
  /** Implemented but not documented property, see:
   * https://github.com/brianc/node-postgres/issues/2665 */
  processID?: number | null;
  /** Assigned manually in addition to PoolClient props. */
  closeAt?: number;
};

/**
 * This class carries connection pooling logic only and delegates the rest to
 * PgClient base class.
 *
 * The idea is that in each particular project, people may have they own classes
 * derived from PgClient, in case the codebase already has some existing
 * connection pooling solution. They don't have to use PgClientPool.
 */
export class PgClientPool extends PgClient {
  /** Default values for the constructor options. */
  static override readonly DEFAULT_OPTIONS: Required<
    PickPartial<PgClientPoolOptions>
  > = {
    ...super.DEFAULT_OPTIONS,
    maxConnLifetimeMs: 0,
    maxConnLifetimeJitter: 0.2,
    prewarmIntervalMs: 10000,
    prewarmQuery: 'SELECT 1 AS "prewarmQuery"',
  };

  /** PG connection pool to use. */
  private readonly pool: Pool;

  /** Prewarming periodic timer (if scheduled). */
  private readonly prewarmTimeout = new Ref<NodeJS.Timeout | null>(null);

  /** Whether the pool has been ended and is not usable anymore. */
  private readonly ended = new Ref(false);

  /** PgClientPool configuration options. */
  override readonly options: Required<PgClientPoolOptions>;

  protected async acquireConn(): Promise<PgClientPoolConn> {
    return this.pool.connect();
  }

  protected releaseConn(conn: PgClientPoolConn): void {
    const needClose = !!(conn.closeAt && Date.now() > conn.closeAt);
    conn.release(needClose);
  }

  protected poolStats(): ClientQueryLoggerProps["poolStats"] {
    return {
      totalConns: this.pool.totalCount,
      idleConns: this.pool.idleCount,
      queuedReqs: this.pool.waitingCount,
    };
  }

  constructor(options: PgClientPoolOptions) {
    super(options);
    this.options = defaults(
      {},
      options,
      (this as PgClient).options,
      PgClientPool.DEFAULT_OPTIONS,
    );

    this.pool = new Pool(this.options.config)
      .on("connect", (client: PgClientPoolConn & PoolClient) => {
        client.id = connNo++;
        client.closeAt =
          maybeCall(this.options.maxConnLifetimeMs) > 0
            ? Date.now() +
              maybeCall(this.options.maxConnLifetimeMs) *
                jitter(maybeCall(this.options.maxConnLifetimeJitter))
            : undefined;
        // Sets a "default error" handler to not let errors leak to e.g. Jest
        // and the outside world as "unhandled error". Appending an additional
        // error handler to EventEmitter doesn't affect the existing error
        // handlers anyhow, so should be safe.
        client.on("error", () => {});
      })
      .on("error", (error) =>
        // Having this hook prevents node from crashing.
        this.logSwallowedError({
          where: 'Pool.on("error")',
          error,
          elapsed: null,
          importance: "low",
        }),
      );
  }

  address(): string {
    const { host, port, database } = this.options.config;
    return (
      host +
      (port ? `:${port}` : "") +
      (database ? `/${database}` : "") +
      "#" +
      this.shardName
    );
  }

  override logSwallowedError(props: SwallowedErrorLoggerProps): void {
    if (!this.ended.current) {
      super.logSwallowedError(props);
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

    const min = Math.min(
      this.options.config.min,
      this.options.config.max ?? Infinity,
    );
    const toPrewarm = min - this.pool.waitingCount;
    if (toPrewarm > 0) {
      const startTime = performance.now();
      range(toPrewarm).forEach(() =>
        runInVoid(
          this.pool.query(maybeCall(this.options.prewarmQuery)).catch((error) =>
            this.logSwallowedError({
              where: `${this.constructor.name}.prewarm`,
              error,
              elapsed: performance.now() - startTime,
              importance: "normal",
            }),
          ),
        ),
      );
    }

    this.prewarmTimeout.current = setTimeout(() => {
      this.prewarmTimeout.current = null;
      this.prewarm();
    }, maybeCall(this.options.prewarmIntervalMs));
  }
}

let connNo = 1;
