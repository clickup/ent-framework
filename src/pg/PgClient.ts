import defaults from "lodash/defaults";
import type pg from "pg";
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
import type { ClientQueryLoggerProps } from "../abstract/Loggers";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { ShardError } from "../abstract/ShardError";
import { TimelineManager } from "../abstract/TimelineManager";
import type { MaybeCallable, MaybeError, PickPartial } from "../internal/misc";
import {
  addSentenceSuffixes,
  maybeCall,
  sanitizeIDForDebugPrinting,
} from "../internal/misc";
import { Ref } from "../internal/Ref";
import type { Hints, Literal } from "../types";
import { escapeLiteral } from "./helpers/escapeLiteral";
import { buildHintQueries } from "./internal/buildHintQueries";
import { CLIENT_ERROR_PREDICATES } from "./internal/misc";
import { parseCompositeRow } from "./internal/parseCompositeRow";
import { parseLsn } from "./internal/parseLsn";
import { PgError } from "./PgError";

/**
 * Options for PgClient constructor.
 */
export interface PgClientOptions extends ClientOptions {
  /** Info on how to discover the shards. */
  shards?: {
    /** Name of a PG shard schema (e.g. "sh%04d"). */
    nameFormat: string;
    /** A SQL query which should return the names of shard schemas served by
     * this Client. */
    discoverQuery: MaybeCallable<string>;
  } | null;
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
export interface PgClientConn extends pg.PoolClient {
  /** Undocumented property of node-postgres, see:
   * https://github.com/brianc/node-postgres/issues/2665 */
  processID?: number | null;
  /** An additional property to the vanilla client: auto-incrementing ID of the
   * connection for logging purposes. */
  id?: number;
  /** An additional property to the vanilla client: number of queries sent
   * within this connection. */
  queriesSent?: number;
  /** An additional property to the vanilla client: when do we want to
   * hard-close that connection. */
  closeAt?: number;
}

/**
 * An abstract PostgreSQL Client which doesn't know how to acquire an actual
 * connection and send queries; these things are up to the derived classes to
 * implement.
 *
 * The idea is that in each particular project, people may have they own classes
 * derived from PgClient, in case the codebase already has some existing
 * connection pooling solution. They don't have to use PgClientPool.
 *
 * Since the class is cloneable internally (using the prototype substitution
 * technique), the contract of this class is that ALL its derived classes may
 * only have readonly immediate properties.
 */
export abstract class PgClient extends Client {
  /** Default values for the constructor options. */
  static override readonly DEFAULT_OPTIONS: Required<
    PickPartial<PgClientOptions>
  > = {
    ...super.DEFAULT_OPTIONS,
    shards: null,
    hints: null,
    role: "unknown",
    maxReplicationLagMs: 60000,
    replicaTimelinePosRefreshMs: 1000,
  };

  /** Number of decimal digits in an ID allocated for shard number. Calculated
   * dynamically based on shards.nameFormat (e.g. for "sh%04d", it will be 4
   * since it expands to "sh0012"). */
  private readonly shardNoPadLen: number = 0;

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
  override readonly options: Required<PgClientOptions>;

  /** Name of the shard associated to this Client. */
  readonly shardName: string = "public";

  /** An active TimelineManager for this particular Client. */
  readonly timelineManager: TimelineManager;

  /**
   * Returns statistics about the connection pool.
   */
  abstract poolStats(): ClientQueryLoggerProps["poolStats"];

  /**
   * Called when the Client needs a connection to run a query against. Implies
   * than the caller MUST call release() method on the returned object.
   */
  abstract acquireConn(): Promise<PgClientConn>;

  /**
   * Initializes an instance of PgClient.
   */
  constructor(options: PgClientOptions) {
    super(options);
    this.options = defaults(
      {},
      options,
      (this as Client).options,
      {
        maxReplicationLagMs:
          options.role === "master" || options.role === "replica"
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

    if (this.options.shards) {
      this.shardNoPadLen = this.buildShardName(0).match(/(\d+)/)
        ? RegExp.$1.length
        : 0;
      if (!this.shardNoPadLen) {
        throw Error("Invalid shards.nameFormat value");
      }
    }
  }

  /**
   * Sends a query (internally, a multi-query). After the query finishes, we
   * should expect that role() returns the actual master/replica role.
   */
  async query<TRow>({
    query: queryLiteral,
    hints,
    isWrite,
    annotations,
    op,
    table,
    batchFactor,
  }: {
    query: Literal;
    hints?: Hints;
    isWrite: boolean;
    annotations: QueryAnnotation[];
    op: string;
    table: string;
    batchFactor?: number;
  }): Promise<TRow[]> {
    const {
      rawPrepend,
      queries,
      queriesRollback,
      debugQueryWithHints,
      resultPos,
    } = this.buildMultiQuery(
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
    let conn: PgClientConn | undefined = undefined;
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

      conn = await this.acquireConn();
      conn.id ??= connNo++;
      conn.queriesSent = (conn.queriesSent ?? 0) + 1;

      queryTime = Math.round(performance.now() - startTime);
      const resMulti = await this.sendMultiQuery(
        conn,
        rawPrepend,
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
        throw new PgError(e, this.options.name, debugQueryWithHints);
      }

      // Some other error which should not trigger query retries or
      // Shards/Islands rediscovery.
      throw e;
    } finally {
      conn?.release();
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
        poolStats: this.poolStats(),
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

  async shardNos(): Promise<readonly number[]> {
    // An installation without sharding enabled.
    if (!this.options.shards) {
      return [0];
    }

    // e.g. sh0000, sh0123 and not e.g. sh1 or sh12345678
    const rows = await this.query<Partial<Record<string, string>>>({
      query: [maybeCall(this.options.shards.discoverQuery)],
      isWrite: false,
      annotations: [],
      op: OP_SHARD_NOS,
      table: "pg_catalog",
    });
    return rows
      .map((row) => Object.values(row)[0])
      .map((name) => {
        const no = name?.match(/(\d+)/) ? parseInt(RegExp.$1) : null;
        return no !== null && name === this.buildShardName(no) ? no : null;
      })
      .filter((no): no is number => no !== null)
      .sort((a, b) => a - b);
  }

  async ping({
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

  shardNoByID(id: string): number {
    // An installation without sharding enabled.
    if (!this.options.shards) {
      return 0;
    }

    // Just a historical exception for id="1".
    if (id === "1") {
      return 1;
    }

    // Composite ID: `(100008888888,1023499999999)` - try extracting non-zero
    // Shard from parts (left to right) first, and if there is none, allow shard
    // zero too.
    if (typeof id === "string" && id.startsWith("(") && id.endsWith(")")) {
      let no = NaN;
      for (const subID of parseCompositeRow(id)) {
        const tryNo =
          subID && subID.length >= this.shardNoPadLen + 1
            ? parseInt(subID.substring(1, this.shardNoPadLen + 1))
            : NaN;
        if (!isNaN(tryNo)) {
          if (tryNo > 0) {
            return tryNo;
          } else if (isNaN(no)) {
            no = tryNo;
          }
        }
      }

      if (isNaN(no)) {
        const idSafe = sanitizeIDForDebugPrinting(id);
        throw Error(
          `Cannot extract shard number from the composite ID ${idSafe}`,
        );
      }

      return no;
    }

    // Plain ID.
    const no =
      typeof id === "string" && id.length >= this.shardNoPadLen + 1
        ? parseInt(id.substring(1, this.shardNoPadLen + 1))
        : NaN;
    if (isNaN(no)) {
      const idSafe = sanitizeIDForDebugPrinting(id);
      throw new ShardError(
        `Cannot parse ID ${idSafe} to detect shard number`,
        this.options.name,
      );
    }

    return no;
  }

  withShard(no: number): this {
    return Object.assign(Object.create(this.constructor.prototype), {
      ...this,
      shardName: this.buildShardName(no),
      // Notice that we can ONLY have readonly properties in this and all
      // derived classes to make it work. If we need some mutable props shared
      // across all of the clones, we need to wrap them in a Ref (and make the
      // Ref object itself readonly). That's a pretty fragile contract though.
    });
  }

  role(): ClientRole {
    return this.reportedRoleAfterLastQuery.current;
  }

  connectionIssue(): ClientConnectionIssue | null {
    return this.reportedConnectionIssue.current;
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
    rawPrepend: string;
    queries: string[];
    queriesRollback: string[];
    debugQueryWithHints: string;
    resultPos: number;
  } {
    const query = escapeLiteral(literal).trimEnd();
    if (query === "") {
      throw Error("Empty query passed to query()");
    }

    const queriesPrologue: string[] = [];
    const queriesEpilogue: string[] = [];
    const queriesRollback: string[] = [];

    const [rawPrepend, hintQueriesDefault, hintQueries] = buildHintQueries(
      this.options.hints ? maybeCall(this.options.hints) : undefined,
      hints,
    );

    // Prepend per-query hints to the prologue (if any); they will be logged.
    queriesPrologue.unshift(...hintQueries);

    // The query which is logged to the logging infra. For more brief messages,
    // we don't log internal hints (this.hints) and search_path; see below.
    const debugQueryWithHints =
      `${rawPrepend}/*${this.shardName}*/` +
      [...queriesPrologue, query].join("; ").trim();

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
      rawPrepend,
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
    conn: PgClientConn,
    rawPrepend: string,
    queries: string[],
    queriesRollback: string[],
  ): Promise<pg.QueryResult[]> {
    const queriesStr = `${rawPrepend}/*${this.shardName}*/${queries.join("; ")}`;

    // For multi-query, query() actually returns an array of pg.QueryResult, but
    // it's not reflected in its TS typing, so patching this.
    const resMulti = (await conn.query(queriesStr).catch(async (e) => {
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

  /**
   * Builds the schema name (aka "Shard name") by Shard number using
   * `options#shards#nameFormat`.
   *
   * E.g. nameFormat="sh%04d" generates names like "sh0042".
   */
  private buildShardName(no: number | string): string {
    //
    return this.options.shards
      ? this.options.shards.nameFormat.replace(
          /%(0?)(\d+)[sd]/,
          (_, zero: string, d: string) =>
            no.toString().padStart(zero ? parseInt(d) : 0, "0"),
        )
      : this.shardName;
  }
}

let connNo = 1;
