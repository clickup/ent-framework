import defaults from "lodash/defaults";
import range from "lodash/range";
import pg from "pg";
import type {
  ClientConnectionIssue,
  ClientOptions,
  ClientPingInput,
  ClientRole,
} from "../abstract/Client";
import { Client } from "../abstract/Client";
import type { ClientErrorPostAction } from "../abstract/ClientError";
import { ClientError } from "../abstract/ClientError";
import {
  OP_PING,
  OP_SHARD_NOS,
  OP_TIMELINE_POS_REFRESH,
} from "../abstract/internal/misc";
import type { SwallowedErrorLoggerProps } from "../abstract/Loggers";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { TimelineManager } from "../abstract/TimelineManager";
import type { MaybeCallable, MaybeError, PickPartial } from "../internal/misc";
import {
  addSentenceSuffixes,
  jitter,
  mapJoin,
  maybeCall,
  runInVoid,
} from "../internal/misc";
import { Ref } from "../internal/Ref";
import type { Hints, Literal } from "../types";
import { escapeLiteral } from "./helpers/escapeLiteral";
import { buildHintQueries } from "./internal/buildHintQueries";
import { CLIENT_ERROR_PREDICATES } from "./internal/misc";
import { parseLsn } from "./internal/parseLsn";
import { PgError } from "./PgError";

/**
 * Options for PgClient constructor.
 */
export interface PgClientOptions<TPool extends pg.Pool = pg.Pool>
  extends ClientOptions {
  /** Node-Postgres config. We can't make it MaybeCallable unfortunately,
   * because it's used to initialize Node-Postgres Pool. */
  config: pg.PoolConfig & { min?: number | undefined };
  /** Should create an instance of Pool class compatible with node-postgres
   * Pool. By default, node-postgres Pool is used. */
  createPool?: (config: pg.PoolConfig) => TPool;
  /** Close the connection after the query if it was opened long time ago. */
  maxConnLifetimeMs?: MaybeCallable<number>;
  /** Jitter for maxConnLifetimeMs. */
  maxConnLifetimeJitter?: MaybeCallable<number>;
  /** Add not more than this number of connections in each prewarm interval. New
   * connections are expensive to establish (especially when SSL is enabled). */
  prewarmIntervalStep?: MaybeCallable<number>;
  /** How often to send bursts of prewarm queries to all Clients to keep the
   * minimal number of open connections. The default value is half of the
   * default node-postgres'es idleTimeoutMillis=10s. Together with 1..1.5x
   * jitter (default prewarmIntervalJitter=0.5), it is still slightly below
   * idleTimeoutMillis, and thus, doesn't let Ent Framework close the
   * connections prematurely. */
  prewarmIntervalMs?: MaybeCallable<number>;
  /** Jitter for prewarmIntervalMs. */
  prewarmIntervalJitter?: MaybeCallable<number>;
  /** What prewarm query to send. */
  prewarmQuery?: MaybeCallable<string>;
  /** If true, also sends prewarm queries and keeps the min number of
   * connections in all sub-pools. See pool() method for details. */
  prewarmSubPools?: boolean;
  /** PG "SET key=value" hints to run before each query. Often times we use it
   * to pass statement_timeout option since e.g. PGBouncer doesn't support
   * per-connection statement timeout in transaction pooling mode: it throws
   * "unsupported startup parameter" error. I.e. we may want to emit "SET
   * statement_timeout TO ..." before each query in multi-query mode. */
  hints?: MaybeCallable<Hints> | null;
  /** After how many milliseconds we give up waiting for the replica to catch up
   * with the master. When role="replica", then this option is the only way to
   * "unlatch" the reads from the master node after a write. */
  maxReplicationLagMs?: MaybeCallable<number>;
  /** Sometimes, the role of this Client is known statically, e.g. when pointing
   * to AWS Aurora writer and reader endpoints. If "master" or "replica" are
   * provided, then no attempt is made to use functions like
   * pg_current_wal_insert_lsn() etc. (they are barely supported in e.g. AWS
   * Aurora). Instead, for "replica" role, it is treated as "always lagging up
   * until maxReplicationLagMs after the last write". If role="unknown", then
   * auto-detection and automatic lag tracking is performed using
   * pg_current_wal_insert_lsn() and other built-in PostgreSQL functions. */
  role?: ClientRole;
  /** Up to how often we call TimelineManager#triggerRefresh(). */
  replicaTimelinePosRefreshMs?: MaybeCallable<number>;
}

/**
 * An opened low-level PostgreSQL connection.
 */
export interface PgClientConn<TPool extends pg.Pool = pg.Pool>
  extends pg.PoolClient {
  /** Pool instance that created this connection. */
  pool: TPool;
  /** An additional property to the vanilla client: auto-incrementing ID of the
   * connection for logging purposes. */
  id: number;
  /** An additional property to the vanilla client: number of queries sent
   * within this connection. */
  queriesSent: number;
  /** An additional property to the vanilla client: when do we want to
   * hard-close that connection. */
  closeAt: number | null;
}

/**
 * A named low-level Pool config used to create sub-pools. Sub-pool derives
 * configuration from the default PgClientOptions#config, but allow overrides.
 * See PgClient#pool() method for details.
 */
export interface PgClientSubPoolConfig extends Partial<pg.PoolConfig> {
  name: string;
}

/**
 * An abstract PostgreSQL Client. Includes connection pooling logic.
 *
 * Since the class is cloneable internally (using the prototype substitution
 * technique, see withShard()), the contract of this class is that ALL its
 * derived classes may only have readonly immediate properties. Use Ref helper
 * if you need some mutable properties.
 */
export class PgClient<TPool extends pg.Pool = pg.Pool> extends Client {
  /** Default values for the constructor options. */
  static override readonly DEFAULT_OPTIONS: Required<
    PickPartial<PgClientOptions<pg.Pool>>
  > = {
    ...super.DEFAULT_OPTIONS,
    createPool: (config) => new pg.Pool(config),
    maxConnLifetimeMs: 0,
    maxConnLifetimeJitter: 0.5,
    prewarmIntervalStep: 1,
    prewarmIntervalMs: 5000,
    prewarmIntervalJitter: 0.5,
    prewarmQuery: 'SELECT 1 AS "prewarmQuery"',
    prewarmSubPools: false,
    hints: null,
    role: "unknown",
    maxReplicationLagMs: 60000,
    replicaTimelinePosRefreshMs: 1000,
  };

  /** PG named connection pools to use. The default pool has `null` key.*/
  private readonly pools = new Map<string | null, TPool>();

  /** Prewarming periodic timer (if scheduled). */
  private readonly prewarmTimeout = new Ref<NodeJS.Timeout | null>(null);

  /** Whether the pool has been ended and is not usable anymore. */
  private readonly ended = new Ref(false);

  /** This value is set after each request to reflect the actual role of the
   * client. The idea is that master/replica role may change online, without
   * reconnecting the Client, so we need to refresh it after each request and be
   * ready for a fallback. The expectation is that the initial value is
   * populated during the very first shardNos() call. */
  private readonly reportedRoleAfterLastQuery: Ref<ClientRole>;

  /** This value is non-null if there was an unsuccessful connection attempt
   * (i.e. the PG is down), and there were no successful queries since then. */
  private readonly reportedConnectionIssue =
    new Ref<ClientConnectionIssue | null>(null);

  /** PgClient configuration options. */
  override readonly options: Required<PgClientOptions<TPool>>;

  /** Name of the shard associated to this Client. */
  readonly shardName: string = "public";

  /** An active TimelineManager for this particular Client. */
  readonly timelineManager: TimelineManager;

  /**
   * Calls swallowedErrorLogger() doing some preliminary amendment.
   */
  protected override logSwallowedError(props: SwallowedErrorLoggerProps): void {
    if (!this.ended.current) {
      super.logSwallowedError(props);
    }
  }

  /**
   * Initializes an instance of PgClient.
   */
  constructor(options: PgClientOptions<TPool>) {
    super(options);
    this.options = defaults(
      {},
      options,
      (this as Client).options,
      {
        maxReplicationLagMs:
          options.role !== "unknown"
            ? 2000 // e.g. AWS Aurora, assuming it always "catches up" fast
            : undefined,
      },
      PgClient.DEFAULT_OPTIONS,
    );

    this.reportedRoleAfterLastQuery = new Ref(this.options.role);

    this.timelineManager = new TimelineManager(
      this.options.maxReplicationLagMs,
      this.options.replicaTimelinePosRefreshMs,
      async () => {
        const startTime = performance.now();
        try {
          await this.query({
            query: [`SELECT '${OP_TIMELINE_POS_REFRESH}'`],
            isWrite: false,
            annotations: [],
            op: OP_TIMELINE_POS_REFRESH,
            table: "pg_catalog",
          });
        } catch (error: unknown) {
          this.logSwallowedError({
            where: OP_TIMELINE_POS_REFRESH,
            error,
            elapsed: Math.round(performance.now() - startTime),
            importance: "normal",
          });
        }
      },
    );
  }

  /**
   * Represents the full destination address this Client is working with.
   * Depending on the implementation, it may include hostname, port number,
   * database name, shard name etc. It is required that the address is stable
   * enough to be able to cache some destination database related metadata (e.g.
   * shardNos) based on that address.
   */
  override address(): string {
    const { host, port, database } = this.options.config;
    return (
      host +
      (port ? `:${port}` : "") +
      (database ? `/${database}` : "") +
      "#" +
      this.shardName
    );
  }

  /**
   * Gracefully closes all the connections of this Client to let the caller
   * destroy it. The pending queries are awaited to finish before returning. The
   * Client becomes unusable right after calling this method (even before the
   * connections are drained): you should not send queries to it.
   */
  override async end(): Promise<void> {
    if (this.ended.current) {
      return;
    }

    this.ended.current = true;
    clearTimeout(this.prewarmTimeout.current ?? undefined);
    this.prewarmTimeout.current = null;
    await mapJoin([...this.pools.values()], async (pool) => pool.end());
  }

  /**
   * Returns true if the Client is ended and can't be used anymore.
   */
  override isEnded(): boolean {
    return this.ended.current;
  }

  /**
   * Returns all Shard numbers discoverable via the connection to the Client's
   * database.
   */
  override async shardNos(): Promise<readonly number[]> {
    const shardNamer = this.options.shardNamer;

    // An installation without sharding enabled.
    if (!shardNamer) {
      return [0];
    }

    // e.g. sh0000, sh0123 and not e.g. sh1 or sh12345678
    const rows = await this.query<Partial<Record<string, string>>>({
      query: [maybeCall(shardNamer.options.discoverQuery)],
      isWrite: false,
      annotations: [],
      op: OP_SHARD_NOS,
      table: "pg_catalog",
    });
    return rows
      .map((row) => Object.values(row)[0])
      .map((name) => (name ? shardNamer.shardNoByName(name) : null))
      .filter((no): no is number => no !== null)
      .sort((a, b) => a - b);
  }

  /**
   * Sends a read or write test query to the server. Tells the server to sit and
   * wait for at least the provided number of milliseconds.
   */
  override async ping({
    execTimeMs,
    isWrite,
    annotation,
  }: ClientPingInput): Promise<void> {
    await this.query<Partial<Record<string, string>>>({
      query: [
        "DO $$ BEGIN PERFORM pg_sleep(?); IF pg_is_in_recovery() AND ? THEN RAISE read_only_sql_transaction; END IF; END $$",
        execTimeMs / 1000,
        isWrite,
      ],
      isWrite,
      annotations: [annotation],
      op: OP_PING,
      table: "pg_catalog",
    });
  }

  /**
   * Creates a new Client which is namespaced to the provided Shard number. The
   * new Client will share the same connection pool with the parent's Client.
   */
  override withShard(no: number): this {
    return Object.assign(Object.create(this.constructor.prototype), {
      ...this,
      shardName: this.options.shardNamer
        ? this.options.shardNamer.shardNameByNo(no)
        : this.shardName,
      // Notice that we can ONLY have readonly properties in this and all
      // derived classes to make it work. If we need some mutable props shared
      // across all of the clones, we need to wrap them in a Ref (and make the
      // Ref object itself readonly). That's a pretty fragile contract though.
    });
  }

  /**
   * Returns the Client's role reported after the last successful query. Master
   * and replica roles may switch online unpredictably, without reconnecting, so
   * we only know the role after a query.
   */
  override role(): ClientRole {
    return this.reportedRoleAfterLastQuery.current;
  }

  /**
   * Returns a non-nullable value if the Client couldn't connect to the server
   * (or it could, but the load balancer reported the remote server as not
   * working), so it should ideally be removed from the list of active replicas
   * until e.g. the next discovery query to it (or any query) succeeds.
   */
  override connectionIssue(): ClientConnectionIssue | null {
    return this.reportedConnectionIssue.current;
  }

  /**
   * A convenience method to put connections prewarming logic to. The idea is to
   * keep the needed number of open connections and also, in each connection,
   * minimize the time which the very 1st query will take (e.g. pre-cache
   * full-text dictionaries).
   */
  override prewarm(): void {
    if (this.prewarmTimeout.current) {
      // Already scheduled a prewarm, so skipping.
      return;
    }

    const subPools = this.options.prewarmSubPools
      ? [...this.pools.entries()]
          .filter(([name]) => name !== null)
          .map(([_, pool]) => pool)
      : [];

    for (const pool of [this.pool(), ...subPools]) {
      const config = pool.options as PgClientOptions["config"];
      if (!config.min) {
        continue;
      }

      const min = Math.min(
        config.min,
        config.max ?? Infinity,
        pool.totalCount + (maybeCall(this.options.prewarmIntervalStep) || 1),
      );
      const toPrewarm = min - pool.waitingCount;
      if (toPrewarm > 0) {
        const startTime = performance.now();
        range(toPrewarm).forEach(() =>
          runInVoid(
            pool
              .query(maybeCall(this.options.prewarmQuery))
              .catch((error: unknown) =>
                this.logSwallowedError({
                  where: `${this.constructor.name}.prewarm`,
                  error,
                  elapsed: Math.round(performance.now() - startTime),
                  importance: "normal",
                }),
              ),
          ),
        );
      }
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
    ).unref();
  }

  /**
   * Returns a default pool (when subPoolConfig is not passed), or a "sub-pool"
   * (a named low-level Pool implementation compatible to node-postgres). The
   * method is specific to the current class and is not a part of
   * database-agnostic Client API.
   * - Sub-pools are lazily created and memoized by the provided name. They may
   *   differ by config options (like statement_timeout or max connections).
   * - Sub-pools inherit the properties from default PgClientOptions.config.
   * - It is implied (but not enforced) that all sub-pools use the same physical
   *   database, because otherwise it makes not a lot of sense.
   */
  pool(subPoolConfig?: PgClientSubPoolConfig): TPool {
    let pool = this.pools.get(subPoolConfig?.name ?? null);
    if (pool) {
      return pool;
    }

    pool = this.options
      .createPool(
        defaults({}, subPoolConfig, this.options.config, {
          allowExitOnIdle: true,
        }),
      )
      .on("connect", (poolClient) => {
        // Called only once, after the connection is 1st created.
        const client = poolClient as PgClientConn<TPool>;

        // Initialize additional properties merged into the default PoolClient.
        const maxConnLifetimeMs =
          maybeCall(this.options.maxConnLifetimeMs) *
          jitter(maybeCall(this.options.maxConnLifetimeJitter));
        client.pool = pool!;
        client.id = connId++;
        client.queriesSent = 0;
        client.closeAt =
          maxConnLifetimeMs > 0
            ? Date.now() + Math.round(maxConnLifetimeMs)
            : null;

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

    this.pools.set(subPoolConfig?.name ?? null, pool);
    return pool;
  }

  /**
   * Called when the Client needs a connection in the default pool (when
   * subPoolConfig is not passed), or in a sub-pool (see pool() method) to run a
   * query against. Implies than the caller MUST call release() method on the
   * returned object. The difference from pool().connect() is that when calling
   * release() on a result of acquireConn(), it additionally closes the
   * connection automatically if was OPENED (not queried!) more than
   * maxConnLifetimeMs ago (node-postgres Pool doesn't have this feature) The
   * method is specific to the current class and is not a part of
   * database-agnostic Client API.
   */
  async acquireConn(
    subPoolConfig?: PgClientSubPoolConfig,
  ): Promise<PgClientConn<TPool>> {
    const pool = this.pool(subPoolConfig);
    const conn = (await pool.connect()) as PgClientConn<TPool>;

    const connReleaseOrig = conn.release.bind(conn);
    conn.release = (arg) => {
      // Manage maxConnLifetimeMs manually since it's not supported by the
      // vanilla node-postgres.
      const needClose = !!(conn.closeAt && Date.now() > conn.closeAt);
      return connReleaseOrig(arg !== undefined ? arg : needClose);
    };

    return conn;
  }

  /**
   * Sends a query (internally, a multi-query) through the default Pool (if
   * subPoolConfig is not passed), or through a named sub-pool (see pool()
   * method). After the query finishes, we should expect that role() returns the
   * actual master/replica role. The method is specific to the current class and
   * is not a part of database-agnostic Client API.
   */
  async query<TRow>({
    query: queryLiteral,
    hints,
    isWrite,
    annotations,
    op,
    table,
    batchFactor,
    subPoolConfig,
  }: {
    query: Literal;
    hints?: Hints;
    isWrite: boolean;
    annotations: QueryAnnotation[];
    op: string;
    table: string;
    batchFactor?: number;
    subPoolConfig?: PgClientSubPoolConfig;
  }): Promise<TRow[]> {
    const { queries, queriesRollback, debugQueryWithHints, resultPos } =
      this.buildMultiQuery(
        hints,
        queryLiteral,
        this.options.role === "unknown"
          ? // For master, we read its WAL LSN (pg_current_wal_insert_lsn) after
            // each query (notice that, when run on a replica,
            // pg_current_wal_insert_lsn() throws, so we call it only if
            // pg_is_in_recovery() returns false). For replica, we read its WAL
            // LSN (pg_last_wal_replay_lsn).
            "SELECT CASE WHEN pg_is_in_recovery() THEN NULL ELSE pg_current_wal_insert_lsn() END AS pg_current_wal_insert_lsn, pg_last_wal_replay_lsn()"
          : undefined,
        isWrite,
      );

    const startTime = performance.now();
    let queryTime: number | undefined = undefined;
    let conn: PgClientConn<TPool> | undefined = undefined;
    let res: TRow[] | undefined = undefined;
    let e: MaybeError<{ severity?: unknown }> = undefined;
    let postAction: ClientErrorPostAction = "fail";

    try {
      if (this.isEnded()) {
        throw new ClientError(
          Error(`Cannot use ${this.constructor.name} since it's ended`),
          this.options.name,
          "choose-another-client",
          "data-on-server-is-unchanged",
          "client_is_ended",
        );
      }

      conn = await this.acquireConn(subPoolConfig);
      conn.queriesSent++;

      queryTime = Math.round(performance.now() - startTime);
      const resMulti = await this.sendMultiQuery(
        conn,
        queries,
        queriesRollback,
      );
      this.reportedConnectionIssue.current = null;

      res = resMulti[resultPos].rows;

      if (this.options.role === "unknown") {
        const lsns = resMulti[resMulti.length - 1].rows[0] as {
          pg_current_wal_insert_lsn: string | null;
          pg_last_wal_replay_lsn: string | null;
        };
        if (lsns.pg_current_wal_insert_lsn !== null) {
          this.reportedRoleAfterLastQuery.current = "master";
          this.timelineManager.setCurrentPos(
            parseLsn(lsns.pg_current_wal_insert_lsn)!,
          );
        } else if (lsns.pg_last_wal_replay_lsn !== null) {
          this.reportedRoleAfterLastQuery.current = "replica";
          this.timelineManager.setCurrentPos(
            parseLsn(lsns.pg_last_wal_replay_lsn),
          );
        } else {
          throw Error(
            "BUG: both pg_current_wal_insert_lsn() and pg_last_wal_replay_lsn() returned null",
          );
        }
      } else if (this.options.role === "master") {
        this.reportedRoleAfterLastQuery.current = "master";
        // In this mode, master pos is always =1 constant.
        this.timelineManager.setCurrentPos(BigInt(1), true);
      } else {
        this.reportedRoleAfterLastQuery.current = "replica";
        // In this mode, replica pos is always =0 constant (i.e. always behind
        // the master), and we solely rely on maxReplicationLagMs timeline data
        // expiration in Timeline object.
        this.timelineManager.setCurrentPos(BigInt(0), true);
      }

      return res;
    } catch (cause: unknown) {
      e = cause as MaybeError<{ severity?: unknown }>;

      if (e instanceof ClientError) {
        throw e;
      }

      // Infer ClientError which affects Client choosing logic.
      for (const predicate of CLIENT_ERROR_PREDICATES) {
        const res = predicate({
          code: "" + e?.code,
          message: "" + e?.message,
        });
        if (res) {
          if (!isWrite) {
            // For read queries, we know for sure that the data wasn't changed.
            res.kind = "data-on-server-is-unchanged";
          }

          postAction =
            this.role() === "master"
              ? res.postAction.ifMaster
              : res.postAction.ifReplica;

          if (res.postAction.reportConnectionIssue) {
            // Mark the current Client as non-healthy, so the retry logic will
            // likely choose another one if available.
            this.reportedConnectionIssue.current = {
              timestamp: new Date(),
              cause,
              postAction,
              kind: res.kind,
              comment: res.comment,
            };
          }

          throw new ClientError(
            e,
            this.options.name,
            postAction,
            res.kind,
            res.abbreviation,
            res.comment +
              (res.kind === "unknown-server-state"
                ? " The write might have been committed on the PG server though."
                : ""),
          );
        }
      }

      // Only wrap the errors which PG sent to us explicitly. Those errors mean
      // that there was some aborted transaction, so it's safe to retry.
      if (e?.severity) {
        throw new PgError(e, this.options.name, debugQueryWithHints, table);
      }

      // Some other error which should not trigger query retries or
      // Shards/Islands rediscovery.
      throw e;
    } finally {
      conn?.release();
      const pool = conn?.pool ?? this.pool(subPoolConfig);
      const now = performance.now();
      this.options.loggers?.clientQueryLogger?.({
        annotations,
        op,
        shard: this.shardName,
        table,
        batchFactor: batchFactor ?? 1,
        msg: debugQueryWithHints,
        output: res ? res : undefined,
        elapsed: {
          total: Math.round(now - startTime),
          acquire:
            queryTime !== undefined ? queryTime : Math.round(now - startTime),
        },
        connStats: {
          id: conn ? "" + (conn.id ?? 0) : "?",
          queriesSent: conn?.queriesSent ?? 0,
        },
        poolStats: {
          totalConns: pool.totalCount,
          idleConns: pool.idleCount,
          queuedReqs: pool.waitingCount,
        },
        error:
          e === undefined
            ? undefined
            : addSentenceSuffixes(
                `${e}`,
                e?.code ? ` (${e.code})` : undefined,
                ` [${postAction}]`,
              ),
        role: this.role(),
        backend: this.options.name,
        address: this.address(),
      });
    }
  }

  /**
   * Prepares a PG Client multi-query from the query literal and hints.
   */
  private buildMultiQuery(
    hints: Hints | undefined,
    literal: Literal,
    epilogue: string | undefined,
    isWrite: boolean,
  ): {
    queries: string[];
    queriesRollback: string[];
    debugQueryWithHints: string;
    resultPos: number;
  } {
    const queriesPrologue: string[] = [];
    const queriesEpilogue: string[] = [];
    const queriesRollback: string[] = [];

    const [rawPrepend, hintQueriesDefault, hintQueries] = buildHintQueries(
      this.options.hints ? maybeCall(this.options.hints) : undefined,
      hints,
    );

    const rawQuery = escapeLiteral(literal).trimEnd();
    if (rawQuery === "") {
      throw Error("Empty query passed to query()");
    }

    const query = rawPrepend + rawQuery;

    // Prepend per-query hints to the prologue (if any); they will be logged.
    queriesPrologue.unshift(...hintQueries);

    // The query which is logged to the logging infra. For more brief messages,
    // we don't log internal hints (this.hints) and search_path; see below.
    const debugQueryWithHints =
      `/*${this.shardName}*/` + [...queriesPrologue, query].join("; ").trim();

    // Prepend internal per-Client hints to the prologue.
    queriesPrologue.unshift(...hintQueriesDefault);

    // We must always have "public" in search_path, because extensions are by
    // default installed in "public" schema. Some extensions may expose
    // operators (e.g. "citext" exposes comparison operators) which must be
    // available in all Shards by default, so they should live in "public".
    // (There is a way to install an extension to a particular schema, but a)
    // there can be only one such schema, and b) there are problems running
    // pg_dump when migrating this Shard to another machine since pg_dump
    // doesn't emit CREATE EXTENSION statement when filtering by schema name).
    queriesPrologue.unshift(
      `SET LOCAL search_path TO ${this.shardName}, public`,
    );

    if (epilogue) {
      queriesEpilogue.push(epilogue);
    }

    // Why wrapping with BEGIN...COMMIT for write queries? See here:
    // https://www.postgresql.org/message-id/20220803.163217.1789690807623885906.horikyota.ntt%40gmail.com
    if (isWrite && queriesEpilogue.length > 0) {
      queriesPrologue.unshift("BEGIN");
      queriesRollback.unshift("ROLLBACK");
      queriesEpilogue.unshift("COMMIT");
    }

    return {
      queries: [...queriesPrologue, query, ...queriesEpilogue],
      queriesRollback,
      debugQueryWithHints,
      resultPos: queriesPrologue.length,
    };
  }

  /**
   * Sends a multi-query to PG Client.
   *
   * A good and simple explanation of the protocol is here:
   * https://www.postgresql.org/docs/13/protocol-flow.html. In short, we can't
   * use prepared-statement-based operations even theoretically, because this
   * mode doesn't support multi-queries. Also notice that TS typing is doomed
   * for multi-queries:
   * https://github.com/DefinitelyTyped/DefinitelyTyped/pull/33297
   */
  private async sendMultiQuery(
    conn: PgClientConn<TPool>,
    queries: string[],
    queriesRollback: string[],
  ): Promise<pg.QueryResult[]> {
    const queriesStr = `/*${this.shardName}*/${queries.join("; ")}`;

    // For multi-query, query() actually returns an array of pg.QueryResult, but
    // it's not reflected in its TS typing, so patching this.
    const resMulti = (await conn.query(queriesStr).catch(async (e: unknown) => {
      // We must run a ROLLBACK if we used BEGIN in the queries, because
      // otherwise the connection is released to the pool in "aborted
      // transaction" state (see the protocol link above).
      queriesRollback.length > 0 &&
        (await conn.query(queriesRollback.join("; ")).catch(() => {}));
      throw e;
    })) as unknown as Array<pg.QueryResult<{}>>;

    if (resMulti.length !== queries.length) {
      throw Error(
        `Multi-query (with semicolons) is not allowed as an input to query(); got ${queriesStr}`,
      );
    }

    return resMulti;
  }
}

/**
 * For backward compatibility, exposing the old name as well.
 * @deprecated Use PgClient instead.
 * @ignore
 */
export const PgClientPool = PgClient;

/**
 * For backward compatibility, exposing the old name as well.
 * @deprecated Use PgClient instead.
 * @ignore
 */
export type PgClientPool = PgClient;

/**
 * For backward compatibility, exposing the old name as well.
 * @deprecated Use PgClientOptions instead.
 * @ignore
 */
export type PgClientPoolOptions = PgClientOptions;

/**
 * Auto-incrementing connection number (for debugging purposes).
 */
let connId = 1;
