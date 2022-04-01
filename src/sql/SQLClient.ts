import { QueryResult, QueryResultRow } from "pg";
import { Client, Loggers } from "../abstract/Client";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { TimelineManager } from "../abstract/TimelineManager";
import { nullthrows, sanitizeIDForDebugPrinting, toFloatMs } from "../helpers";
import { SQLError } from "./SQLError";

const DEFAULT_MAX_REPLICATION_LAG_MS = 60000;
const DEFAULT_REPLICA_TIMELINE_POS_REFRESH_MS = 1000;
const MAX_BIGINT = "9223372036854775807";
const MAX_BIGINT_RE = new RegExp("^\\d{1," + MAX_BIGINT.length + "}$");

/**
 * An opened PostgreSQL connection. Only multi-queries are supported.
 */
export interface SQLClientConn {
  id?: number;
  processID?: number | null;
  query<R extends QueryResultRow = any>(
    queryTextOrConfig: string
  ): Promise<Array<QueryResult<R>>>;
  release(err?: Error | boolean): void;
}

/**
 * An abstract PostgreSQL client which doesn't know how to acquire an actual
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
      this.query(
        "SELECT 'TIMELINE_POS_REFRESH'",
        "TIMELINE_POS_REFRESH",
        "pg_catalog",
        [],
        1
      )
  );

  constructor(
    name: string,
    isMaster: boolean,
    loggers: Loggers,
    private shards?: {
      nameFormat: string;
      discoverQuery: string;
    },
    private maxReplicationLagMs?: number
  ) {
    super(name, isMaster, loggers);
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

  protected abstract acquireConn(): Promise<SQLClientConn>;

  protected abstract releaseConn(conn: SQLClientConn): void;

  async query<TRow>(
    query: string | { query: string; hints: Record<string, string> },
    op: string,
    table: string,
    annotations: QueryAnnotation[],
    batchFactor: number
  ): Promise<TRow[]> {
    const queriesSet =
      typeof query === "object"
        ? Object.entries(query.hints).map(([k, v]) => `SET ${k} TO ${v}`)
        : [];
    const queriesReset =
      typeof query === "object"
        ? Object.keys(query.hints).map((k) => `RESET ${k}`)
        : [];

    query = (typeof query === "object" ? query.query : query).trimEnd();
    const queryWithHints = // this is what's logged as a string
      `/*${this.shardName}*/` + [...queriesSet, query].join("; ");

    try {
      const startTime = process.hrtime();
      let error: string | undefined;
      let connID: number | null = null;
      let processID: number | null = null;
      let res: TRow[] | undefined;

      try {
        const conn = await this.acquireConn();
        connID = conn.id ?? 0;
        processID = conn.processID ?? 0;
        try {
          if (query === "") {
            throw Error("Empty query passed to query()");
          }

          // A good and simple explanation of the protocol is here:
          // https://www.postgresql.org/docs/13/protocol-flow.html. In short, we
          // can't use prepared-statement-based operations even theoretically,
          // because this mode doesn't support multi-queries. Also notice that
          // TS typing is doomed for multi-queries:
          // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/33297
          const resMulti = await conn.query(
            // We must always have "public" in search_path, because extensions
            // are by default installed in "public" schema. Some extensions may
            // expose operators (e.g. "citext" exposes comparison operators)
            // which must be available in all shards by default, so they should
            // live in "public". (There is a way to install an extension to a
            // particular schema, but a) there can be only one such schema, and
            // b) there are be problems running pg_dump to migrate this shard to
            // another machine since pg_dump doesn't emit CREATE EXTENSION
            // statement when filtering by schema name).
            [
              `SET search_path TO ${this.shardName}, public`,
              queryWithHints,
              ...queriesReset,
              "SELECT " +
                (this.isMaster
                  ? "pg_current_wal_insert_lsn()" // on master
                  : "pg_last_wal_replay_lsn()"), // on replica
            ].join("; ")
          );

          if (resMulti.length !== 3 + queriesSet.length + queriesReset.length) {
            throw Error(
              `Multi-query (with semicolons) is not allowed as an input to query(); got ${queryWithHints}`
            );
          }

          res = resMulti[1 + queriesSet.length].rows;

          const lsn = resMulti[resMulti.length - 1].rows[0] as {
            pg_current_wal_insert_lsn?: string | null;
            pg_last_wal_replay_lsn?: string | null;
          };
          this.timelineManager.setCurrentPos(
            this.isMaster
              ? // Master always has pg_current_wal_insert_lsn defined.
                nullthrows(parseLsn(lsn.pg_current_wal_insert_lsn))
              : // When pg_last_wal_replay_lsn is returned as null, it means that
                // the client's database is not a replica, i.e. it doesn't
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
      } catch (e: any) {
        error = "" + e;
        throw e;
      } finally {
        this.loggers.clientQueryLogger?.({
          annotations,
          connID: "" + connID,
          backendPID: processID ?? 0,
          backend: this.name,
          op,
          shard: this.shardName,
          table,
          batchFactor,
          msg: queryWithHints,
          output: res ? res : undefined,
          elapsed: toFloatMs(process.hrtime(startTime)),
          error,
          isMaster: this.isMaster,
        });
      }

      return res;
    } catch (origError) {
      if (origError instanceof Error && (origError as any).severity) {
        // Only wrap the errors which PG sent to us explicitly. Those errors
        // mean that there was some aborted transaction.
        throw new SQLError(origError, this.name, queryWithHints.trim());
      } else {
        // Some other error (hard to reproduce; possibly a connection error?).
        throw origError;
      }
    }
  }

  async shardNos(): Promise<readonly number[]> {
    if (!this.shards) {
      return [0];
    }

    try {
      // e.g. sh0000, sh0123 and not e.g. sh1 or sh12345678
      const rows = await this.query<Partial<Record<string, string>>>(
        this.shards.discoverQuery,
        "SHARDS",
        "shards",
        [],
        1
      );
      return rows
        .map((row) => Object.values(row)[0])
        .map((name) => {
          const no = name?.match(/(\d+)/) ? parseInt(RegExp.$1) : null;
          return no !== null && name === this.buildShardName(no) ? no : null;
        })
        .filter((no): no is number => no !== null)
        .sort();
    } catch (e: any) {
      // Being unable to access a DB is not a critical error here, we'll just
      // miss some shards (and other shards will work). DO NOT throw through
      // here yet! This needs to be addressed holistically and with careful
      // retries. Also, we have shards rediscovery every 10 or so seconds, so a
      // missing island will self-heal eventually.
      this.logGlobalError("shardNos()", e);
      return [];
    }
  }

  shardNoByID(id: string): number {
    if (!this.shards) {
      return 0;
    }

    if (id === "1") {
      // Just a historical exception.
      return 1;
    }

    const no =
      typeof id === "string" && id.length >= this.shardNoPadLen + 1
        ? parseInt(id.substring(1, this.shardNoPadLen + 1))
        : NaN;
    if (isNaN(no)) {
      const idSafe = sanitizeIDForDebugPrinting(id);
      throw Error(`Cannot parse ID ${idSafe} to detect shard number`);
    }

    return no;
  }

  withShard(no: number): this {
    return Object.assign(Object.create(this.constructor.prototype), {
      ...this,
      shardName: this.buildShardName(no),
      // Notice that timelineManager is DERIVED from the current object; thus,
      // it's shared across all the clients within the island.
    });
  }

  private buildShardName(no: number | string) {
    // e.g. "sh%04d" -> "sh0042"
    return this.shards
      ? this.shards.nameFormat.replace(
          /%(0?)(\d+)[sd]/,
          (_, zero: string, d: string) =>
            no.toString().padStart(zero ? parseInt(d) : 0, "0")
        )
      : this.shardName;
  }

  protected logGlobalError(where: string, e: any) {
    // eslint-disable-next-line no-console
    console.log(`SQLClient: ${where}: ${e}`);
  }
}

export function isBigintStr(str: string) {
  return (
    !!str.match(MAX_BIGINT_RE) &&
    (str.length < MAX_BIGINT.length || str <= MAX_BIGINT)
  );
}

export function escapeIdent(ident: any): string {
  return ident.match(/^[a-z_][a-z_0-9]*$/is)
    ? ident
    : '"' + ident.replace(/"/g, '""') + '"';
}

export function escapeAny(v: any): string {
  // Try to not use this function; although it protects against SQL injections,
  // it's not aware of the actual field type, so it e.g. cannot prevent a bigint
  // overflow SQL error.
  return v === null || v === undefined
    ? "NULL"
    : typeof v === "number"
    ? "" + v
    : typeof v === "boolean"
    ? escapeBoolean(v)
    : v instanceof Date
    ? escapeDate(v)
    : escapeString(v);
}

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

export function escapeString(v: string | null | undefined): string {
  return v === null || v === undefined
    ? "NULL"
    : // Postgres doesn't like ASCII NUL character (error message is "unterminated
      // quoted string" or "invalid message format"), so we remove it too.
      "'" + ("" + v).replace(/\0/g, "").replace(/'/g, "''") + "'";
}

export function escapeDate(v: Date | null | undefined, field?: string): string {
  try {
    return v === null || v === undefined ? "NULL" : "'" + v.toISOString() + "'";
  } catch (e) {
    throw Error(`Failed to perform escapeDate for "${field}": ${e}`);
  }
}

export function escapeBoolean(v: boolean | null | undefined): string {
  return v === null || v === undefined ? "NULL" : v ? "true" : "false";
}

export function escapeStringify(v: any, stringify: (v: any) => string): string {
  return v === null || v === undefined ? "NULL" : escapeString(stringify(v));
}

export function parseLsn(lsn: string | null | undefined) {
  if (!lsn) {
    return null;
  }

  const [a, b] = lsn.split("/").map((x) => BigInt(parseInt(x, 16)));
  return (a << BigInt(32)) + b;
}
