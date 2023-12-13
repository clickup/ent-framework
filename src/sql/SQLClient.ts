import { inspect } from "util";
import type { QueryResult, QueryResultRow } from "pg";
import { Client } from "../abstract/Client";
import type { ClientQueryLoggerProps, Loggers } from "../abstract/Loggers";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";

import { ShardError } from "../abstract/ShardError";
import { TimelineManager } from "../abstract/TimelineManager";
import { nullthrows, sanitizeIDForDebugPrinting } from "../helpers/misc";
import type { Literal } from "../types";
import parseCompositeRow from "./helpers/parseCompositeRow";
import { SQLError } from "./SQLError";

const DEFAULT_MAX_REPLICATION_LAG_MS = 60000;
const DEFAULT_REPLICA_TIMELINE_POS_REFRESH_MS = 1000;
const MAX_BIGINT = "9223372036854775807";
const MAX_BIGINT_RE = new RegExp("^\\d{1," + MAX_BIGINT.length + "}$");
const PG_CODE_UNDEFINED_TABLE = "42P01";

/**
 * An opened PostgreSQL connection. Only multi-queries are supported.
 */
export interface SQLClientConn {
  id?: number;
  query<R extends QueryResultRow = any>(
    query: string
  ): Promise<Array<QueryResult<R>>>;
  release(err?: Error | boolean): void;
}

/**
 * An abstract PostgreSQL Client which doesn't know how to acquire an actual
 * connection and send queries; these things are up to the derived classes to
 * implement.
 */
export abstract class SQLClient extends Client {
  private shardNoPadLen: number;

  readonly shardName: string = "public";

  readonly timelineManager = new TimelineManager(
    this.maxReplicationLagMs ?? DEFAULT_MAX_REPLICATION_LAG_MS,
    this.isMaster ? null : DEFAULT_REPLICA_TIMELINE_POS_REFRESH_MS,
    async () =>
      this.query({
        query: ["SELECT 'TIMELINE_POS_REFRESH'"],
        isWrite: false,
        annotations: [],
        op: "TIMELINE_POS_REFRESH",
        table: "pg_catalog",
      })
  );

  protected abstract acquireConn(): Promise<SQLClientConn>;

  protected abstract releaseConn(conn: SQLClientConn): void;

  protected abstract poolStats(): ClientQueryLoggerProps["poolStats"];

  constructor(
    name: string,
    isMaster: boolean,
    loggers: Loggers,
    private hints?: Record<string, string>,
    private shards?: {
      nameFormat: string;
      discoverQuery: string;
    },
    private maxReplicationLagMs?: number,
    batchDelayMs?: number | (() => number)
  ) {
    super(name, isMaster, loggers, batchDelayMs);
    if (this.shards) {
      this.shardNoPadLen = this.buildShardName(0).match(/(\d+)/)
        ? RegExp.$1.length
        : 0;
      if (!this.shardNoPadLen) {
        throw Error("Invalid shards.nameFormat value");
      }
    } else {
      this.shardNoPadLen = 0;
    }
  }

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
    hints?: Record<string, string>;
    isWrite: boolean;
    annotations: QueryAnnotation[];
    op: string;
    table: string;
    batchFactor?: number;
  }): Promise<TRow[]> {
    annotations ??= [];

    const query = escapeLiteral(queryLiteral).trimEnd();

    const queriesPrologue: string[] = [];
    const queriesEpilogue: string[] = [];
    const queriesRollback: string[] = [];

    // Prepend per-query hints to the prologue (if any); they will be logged.
    if (hints) {
      queriesPrologue.unshift(
        ...Object.entries(hints).map(([k, v]) => `SET LOCAL ${k} TO ${v}`)
      );
    }

    // The query which is logged to the logging infra. For more brief messages,
    // we don't log internal hints (this.hints) and search_path; see below.
    const debugQueryWithHints =
      `/*${this.shardName}*/` + [...queriesPrologue, query].join("; ");

    // Prepend internal per-Client hints to the prologue.
    if (this.hints) {
      queriesPrologue.unshift(
        ...Object.entries(this.hints).map(([k, v]) => `SET LOCAL ${k} TO ${v}`)
      );
    }

    // We must always have "public" in search_path, because extensions are by
    // default installed in "public" schema. Some extensions may expose
    // operators (e.g. "citext" exposes comparison operators) which must be
    // available in all Shards by default, so they should live in "public".
    // (There is a way to install an extension to a particular schema, but a)
    // there can be only one such schema, and b) there are be problems running
    // pg_dump to migrate this Shard to another machine since pg_dump doesn't
    // emit CREATE EXTENSION statement when filtering by schema name).
    queriesPrologue.unshift(
      `SET LOCAL search_path TO ${this.shardName}, public`
    );

    // Why BEGIN...COMMIT for write queries? See here:
    // https://www.postgresql.org/message-id/20220803.163217.1789690807623885906.horikyota.ntt%40gmail.com
    if (isWrite) {
      queriesPrologue.unshift("BEGIN");
      queriesRollback.push("ROLLBACK");
      queriesEpilogue.push("COMMIT");
    }

    if (this.isMaster) {
      // For master, we read its WAL LSN after each query.
      queriesEpilogue.push("SELECT pg_current_wal_insert_lsn()");
    } else {
      // For replica, we read its WAL LSN as a piggy pack to each query.
      queriesEpilogue.push("SELECT pg_last_wal_replay_lsn()");
    }

    const queries = [...queriesPrologue, query, ...queriesEpilogue];

    try {
      const startTime = performance.now();
      let acquireElapsed: number | null = null;
      let error: string | undefined;
      let connID: number | null = null;
      let res: TRow[] | undefined;

      try {
        const conn = await this.acquireConn();
        acquireElapsed = performance.now() - startTime;
        connID = conn.id ?? 0;
        try {
          if (query === "") {
            throw Error("Empty query passed to query()");
          }

          let resMulti: Array<QueryResult<any>>;
          try {
            // A good and simple explanation of the protocol is here:
            // https://www.postgresql.org/docs/13/protocol-flow.html. In short, we
            // can't use prepared-statement-based operations even theoretically,
            // because this mode doesn't support multi-queries. Also notice that
            // TS typing is doomed for multi-queries:
            // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/33297
            resMulti = await conn.query(
              `/*${this.shardName}*/${queries.join("; ")}`
            );
          } catch (e: unknown) {
            // We must run a ROLLBACK if we used BEGIN in the queries, because
            // otherwise the connection is released to the pool in "aborted
            // transaction" state (see the protocol link above).
            if (queriesRollback.length > 0) {
              await conn.query(queriesRollback.join("; ")).catch(() => {});
            }

            throw e;
          }

          if (resMulti.length !== queries.length) {
            throw Error(
              `Multi-query (with semicolons) is not allowed as an input to query(); got ${debugQueryWithHints}`
            );
          }

          res = resMulti[queriesPrologue.length].rows;

          const lsn = resMulti[resMulti.length - 1].rows[0] as {
            pg_current_wal_insert_lsn?: string | null;
            pg_last_wal_replay_lsn?: string | null;
          };
          this.timelineManager.setCurrentPos(
            this.isMaster
              ? // Master always has pg_current_wal_insert_lsn defined.
                nullthrows(parseLsn(lsn.pg_current_wal_insert_lsn))
              : // When pg_last_wal_replay_lsn is returned as null, it means that
                // the Client's database is not a replica, i.e. it doesn't
                // replay from a master. This happens e.g. on dev environment
                // when testing replication lag code (typically done by just
                // manually creating a copy of the database and declaring it as
                // a replica). For such cases, we treat such "replica" as always
                // lagging, i.e. having pos=0 which is less than any known
                // master's pos.
                parseLsn(lsn.pg_last_wal_replay_lsn) ?? BigInt(0)
          );
        } finally {
          this.releaseConn(conn);
        }
      } catch (e: unknown) {
        error = "" + e;
        throw e;
      } finally {
        const totalElapsed = performance.now() - startTime;
        this.loggers.clientQueryLogger?.({
          annotations,
          connID: "" + connID,
          backend: this.name,
          op,
          shard: this.shardName,
          table,
          batchFactor: batchFactor ?? 1,
          msg: debugQueryWithHints,
          output: res ? res : undefined,
          elapsed: {
            total: totalElapsed,
            acquire: acquireElapsed ?? totalElapsed,
          },
          poolStats: this.poolStats(),
          error,
          isMaster: this.isMaster,
        });
      }

      return res;
    } catch (origError: unknown) {
      if (
        origError instanceof Error &&
        (origError as any).code === PG_CODE_UNDEFINED_TABLE
      ) {
        throw new ShardError(origError, this.name, "rediscover");
      } else if (origError instanceof Error && (origError as any).severity) {
        // Only wrap the errors which PG sent to us explicitly. Those errors
        // mean that there was some aborted transaction.
        throw new SQLError(origError, this.name, debugQueryWithHints.trim());
      } else {
        // Some other error (hard to reproduce; possibly a connection error?).
        throw origError;
      }
    }
  }

  async shardNos(): Promise<readonly number[]> {
    // An installation without sharding enabled.
    if (!this.shards) {
      return [0];
    }

    // e.g. sh0000, sh0123 and not e.g. sh1 or sh12345678
    const rows = await this.query<Partial<Record<string, string>>>({
      query: [this.shards.discoverQuery],
      isWrite: false,
      annotations: [],
      op: "SHARDS",
      table: "pg_catalog",
    });
    return rows
      .map((row) => Object.values(row)[0])
      .map((name) => {
        const no = name?.match(/(\d+)/) ? parseInt(RegExp.$1) : null;
        return no !== null && name === this.buildShardName(no) ? no : null;
      })
      .filter((no): no is number => no !== null)
      .sort();
  }

  shardNoByID(id: string): number {
    // An installation without sharding enabled.
    if (!this.shards) {
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
          `Cannot extract shard number from the composite ID ${idSafe}`
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
        this.name,
        "fail"
      );
    }

    return no;
  }

  withShard(no: number): this {
    return Object.assign(Object.create(this.constructor.prototype), {
      ...this,
      shardName: this.buildShardName(no),
      // Notice that timelineManager is DERIVED from the current object; thus,
      // it's shared across all the Clients within the Island.
    });
  }

  private buildShardName(no: number | string): string {
    // e.g. "sh%04d" -> "sh0042"
    return this.shards
      ? this.shards.nameFormat.replace(
          /%(0?)(\d+)[sd]/,
          (_, zero: string, d: string) =>
            no.toString().padStart(zero ? parseInt(d) : 0, "0")
        )
      : this.shardName;
  }
}

/**
 * It's hard to support PG bigint type in JS, so people use strings instead.
 * THis function checks that a string can be passed to PG as a bigint.
 */
export function isBigintStr(str: string): boolean {
  return (
    !!str.match(MAX_BIGINT_RE) &&
    (str.length < MAX_BIGINT.length || str <= MAX_BIGINT)
  );
}

/**
 * Optionally encloses a PG identifier (like table name) in "".
 */
export function escapeIdent(ident: any): string {
  return ident.match(/^[a-z_][a-z_0-9]*$/is)
    ? ident
    : '"' + ident.replace(/"/g, '""') + '"';
}

/**
 * Tries its best to escape the value according to its type.
 *
 * Try to not use this function; although it protects against SQL injections,
 * it's not aware of the actual field type, so it e.g. cannot prevent a bigint
 * overflow SQL error.
 */
export function escapeAny(v: any): string {
  return v === null || v === undefined
    ? "NULL"
    : typeof v === "number"
    ? v.toString()
    : typeof v === "boolean"
    ? escapeBoolean(v)
    : v instanceof Date
    ? escapeDate(v)
    : v instanceof Array
    ? escapeArray(v)
    : escapeString(v);
}

/**
 * Escapes a value implying that it's a PG ID (which is a bigint). This should
 * be a preferred way of escaping when we know that the value is a bigint.
 */
export function escapeID(v: string | null | undefined): string {
  if (v === null || v === undefined) {
    return "NULL";
  }

  const str = "" + v;
  if (!isBigintStr(str)) {
    return "'-1'/*bad_bigint*/";
  }

  return escapeString(str);
}

/**
 * Escapes a string as PG string literal.
 */
export function escapeString(v: string | null | undefined): string {
  return v === null || v === undefined
    ? "NULL"
    : // Postgres doesn't like ASCII NUL character (error message is "unterminated
      // quoted string" or "invalid message format"), so we remove it too.
      "'" + ("" + v).replace(/\0/g, "").replace(/'/g, "''") + "'";
}

/**
 * Escapes an array of strings.
 */
export function escapeArray(
  obj: Array<string | null> | null | undefined
): string {
  return obj === null || obj === undefined
    ? "NULL"
    : escapeString(
        "{" +
          obj
            .map((v) =>
              v === null
                ? "NULL"
                : `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
            )
            .join(",") +
          "}"
      );
}

/**
 * Escapes a date as PG string literal.
 */
export function escapeDate(v: Date | null | undefined, field?: string): string {
  try {
    return v === null || v === undefined ? "NULL" : "'" + v.toISOString() + "'";
  } catch (e: unknown) {
    throw Error(`Failed to perform escapeDate for "${field}": ${e}`);
  }
}

/**
 * Escapes a boolean as PG string literal.
 */
export function escapeBoolean(v: boolean | null | undefined): string {
  return v === null || v === undefined ? "NULL" : v ? "true" : "false";
}

/**
 * PostgreSQL doesn't allow comparison like `WHERE (a, b) = '(1,2)'` - it throws
 * "Input of anonymous composite types is not implemented" error. So to compare,
 * we have to convert the stringified row representation to ROW() notation
 * manually: `WHERE (a, b) = ROW('1', '2')`
 *
 * Notice that we don't work with ROWs consisting of 1 element; instead, we
 * treat them as the element itself. I.e. instead of emitting "(123)" or
 * "ROW(123)", we always emit just "123".
 *
 * - "1" => "1"
 * - "(1)" => "1"
 * - "(1,2)" => "ROW('1','2')"
 */
export function escapeComposite(v: string | null | undefined): string {
  if (v === null || v === undefined) {
    return "NULL";
  }

  const parts =
    v.startsWith("(") && v.endsWith(")") ? parseCompositeRow(v) : [v];
  const list = parts.map((v) => escapeString(v)).join(",");
  return parts.length > 1 ? `ROW(${list})` : list;
}

/**
 * A pair for escapeComposite(), but works with a list of identifiers (e.g. list
 * of unique key fields), not with values.
 *
 * - fields=["some_id"], table="tbl"  => "tbl.some_id"
 * - fields=["f1", "f2"], table="tbl" => "(tbl.f1,tbl.f2)"
 */
export function escapeIdentComposite(
  fields: readonly string[],
  table?: string
): string {
  const list = fields
    .map((k) => (table ? `${escapeIdent(table)}.` : "") + escapeIdent(k))
    .join(",");
  return fields.length > 1 ? `ROW(${list})` : list;
}

/**
 * A helper method which additionally calls to a stringify() function before
 * escaping the value as string.
 */
export function escapeStringify(v: any, stringify: (v: any) => string): string {
  return v === null || v === undefined ? "NULL" : escapeString(stringify(v));
}

/**
 * Builds a part of SQL query using ?-placeholders to prevent SQL Injection.
 * Everywhere where we want to accept a piece of SQL, we should instead accept a
 * Literal tuple.
 *
 * The function converts a Literal tuple [fmt, ...args] into a string, escaping
 * the args and interpolating them into the format SQL where "?" is a
 * placeholder for the replacing value.
 */
export function escapeLiteral(literal: Literal): string {
  if (
    !(literal instanceof Array) ||
    literal.length === 0 ||
    typeof literal[0] !== "string"
  ) {
    throw Error(
      "Invalid literal value (must be an array with 1st element as a format): " +
        inspect(literal)
    );
  }

  if (literal.length === 1) {
    return literal[0];
  }

  const [fmt, ...args] = literal;
  return fmt.replace(/\?([i]?)/g, (_, flag) =>
    flag === "i" ? escapeID("" + args.shift()) : escapeAny(args.shift())
  );
}

/**
 * Parses a WAL LSN number into a JS bigint.
 */
function parseLsn(lsn: string | null | undefined): bigint | null {
  if (!lsn) {
    return null;
  }

  const [a, b] = lsn.split("/").map((x) => BigInt(parseInt(x, 16)));
  return (a << BigInt(32)) + b;
}
