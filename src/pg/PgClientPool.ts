import defaults from "lodash/defaults";
import range from "lodash/range";
import type { PoolConfig } from "pg";
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
  /** Pool class (constructor) compatible with node-postgres Pool. */
  Pool?: typeof Pool;
  /** Close the connection after the query if it was opened long time ago. */
  maxConnLifetimeMs?: MaybeCallable<number>;
  /** Jitter for maxConnLifetimeMs. */
  maxConnLifetimeJitter?: MaybeCallable<number>;
  /** Add not more than this number of connections in each prewarm interval. New
   * connections are expensive to establish (especially when SSL is enabled). */
  prewarmIntervalStep?: MaybeCallable<number>;
  /** How often to send bursts of prewarm queries to all Clients to keep the
   * minimal number of open connections. */
  prewarmIntervalMs?: MaybeCallable<number>;
  /** Jitter for prewarmIntervalMs. */
  prewarmIntervalJitter?: MaybeCallable<number>;
  /** What prewarm query to send. */
  prewarmQuery?: MaybeCallable<string>;
}

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
    Pool,
    maxConnLifetimeMs: 0,
    maxConnLifetimeJitter: 0.5,
    prewarmIntervalStep: 1,
    prewarmIntervalMs: 10000,
    prewarmIntervalJitter: 0.5,
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

  constructor(options: PgClientPoolOptions) {
    super(options);
    this.options = defaults(
      {},
      options,
      (this as PgClient).options,
      PgClientPool.DEFAULT_OPTIONS,
    );

    this.pool = new this.options.Pool(this.options.config)
      .on("connect", (client: PgClientConn) => {
        // Called only once, after the connection is 1st created.
        const maxConnLifetimeMs = maybeCall(this.options.maxConnLifetimeMs);
        if (maxConnLifetimeMs > 0) {
          client.closeAt =
            Date.now() +
            Math.round(
              maxConnLifetimeMs *
                jitter(maybeCall(this.options.maxConnLifetimeJitter)),
            );
        }

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

  async acquireConn(): Promise<PgClientConn> {
    const conn: PgClientConn = await this.pool.connect();
    const connReleaseOrig = conn.release.bind(conn);
    conn.release = (arg) => {
      // Manage maxConnLifetimeMs manually since it's not supported by the
      // vanilla node-postgres.
      const needClose = !!(conn.closeAt && Date.now() > conn.closeAt);
      return connReleaseOrig(arg !== undefined ? arg : needClose);
    };

    return conn;
  }

  poolStats(): ClientQueryLoggerProps["poolStats"] {
    return {
      totalConns: this.pool.totalCount,
      idleConns: this.pool.idleCount,
      queuedReqs: this.pool.waitingCount,
    };
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
      this.pool.totalCount + (maybeCall(this.options.prewarmIntervalStep) || 1),
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

    this.prewarmTimeout.current = setTimeout(
      () => {
        this.prewarmTimeout.current = null;
        this.prewarm();
      },
      Math.round(
        maybeCall(this.options.prewarmIntervalMs) *
          jitter(maybeCall(this.options.prewarmIntervalJitter)),
      ),
    );
  }
}
