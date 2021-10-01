import { Pool, PoolClient, PoolConfig, QueryResult } from "pg";
import { Client, Loggers } from "../abstract/Client";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import {
  copyStack,
  runInVoid,
  sanitizeIDForDebugPrinting,
  toFloatMs,
} from "../helpers";

const MAX_BIGINT = "9223372036854775807";
const MAX_BIGINT_RE = new RegExp("^\\d{1," + MAX_BIGINT.length + "}$");
const ONE_SECOND_IN_US = BigInt(1e9);

/**
 * Outside of Ent-framework code, you probably want to use isSlapdashID
 */
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
  // Try to not use this function; although it protects against SQL
  // injections, it's not aware of the actual field type, so it e.g.
  // cannot prevent a bigint overflow SQL error.
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

export function escapeDate(v: Date | null | undefined): string {
  return v === null || v === undefined ? "NULL" : "'" + v.toISOString() + "'";
}

export function escapeBoolean(v: boolean | null | undefined): string {
  return v === null || v === undefined ? "NULL" : v ? "true" : "false";
}

export function escapeStringify(v: any, stringify: (v: any) => string): string {
  return v === null || v === undefined ? "NULL" : escapeString(stringify(v));
}

export class SQLError extends Error {
  #sql: string;

  constructor(public readonly origError: any, destName: string, sql: string) {
    super(origError.message);

    Object.defineProperty(this, "name", {
      value: this.constructor.name,
      writable: true,
      enumerable: false,
    });
    this.#sql = sql;

    copyStack(this, origError);
    this.stack += "\n" + destName + ": " + sql.replace(/\s*\n\s*/g, " ");
    delete origError.stack;
  }

  /**
   * We could've just make this.sql a readonly property (and not #sql) instead,
   * but then it'd be exposed when printing the error via inspect() or
   * console.log(), which we don't want to. So instead, we define it as a getter
   * function (which is "invisible" when using e.g. console.log()).
   */
  sql() {
    return this.#sql;
  }

  isFKError(fkName?: string) {
    return (
      this.message.includes("foreign key constraint") &&
      (!fkName || this.message.includes(fkName))
    );
  }
}

export interface SQLClient extends Client {
  query<TRes>(
    query: string,
    op: string,
    table: string,
    annotations: Iterable<QueryAnnotation>,
    batchFactor: number
  ): Promise<TRes[]>;
}

export interface SQLClientPoolDest {
  name: string;
  shards: {
    nameFormat: string;
    discoverQuery: string;
  };
  isMaster: boolean;
  config: PoolConfig & {
    maxConnLifetimeMs?: number;
  };
}

const PREWARM_INTERVAL_MS = 10000;
const MAX_CONN_LIFETIME_JITTER = 0.2;

// Our extension to Pool connection which adds a couple props to the connection
// in on("connect") handler (persistent for the same connection objects, i.e.
// across queries in the same connection).
type PoolClientX = PoolClient & {
  id?: number;
  closeAt?: number;
};

let connNo = 1;

export class SQLClientPool extends Client implements SQLClient {
  readonly shardName = "public";
  private sqlPreamble: string = "";

  private pool: Pool;
  private shardNoPadLen: number;

  constructor(public readonly dest: SQLClientPoolDest, loggers: Loggers) {
    super(dest.name, dest.isMaster, loggers);

    this.shardNoPadLen = this.buildShardName(0).match(/(\d+)/)
      ? RegExp.$1.length
      : 0;
    if (!this.shardNoPadLen) {
      throw Error("Invalid shards.nameFormat value");
    }

    this.pool = new Pool(dest.config)
      .on("connect", (conn: PoolClientX) => {
        conn.id = connNo++;
        conn.closeAt = dest.config.maxConnLifetimeMs
          ? Date.now() +
            dest.config.maxConnLifetimeMs *
              (1 + MAX_CONN_LIFETIME_JITTER * Math.random())
          : undefined;
      })
      .on("error", (e) => {
        // Having this hook prevents node from crashing.
        logGlobalError("SQLClientPool", e);
      });
  }

  xid(): bigint {
    // TODO: implement real xlog position fetching
    return this.dest.isMaster
      ? process.hrtime.bigint()
      : process.hrtime.bigint() - ONE_SECOND_IN_US;
  }

  async query<TRes>(
    query: string,
    op: string,
    table: string,
    annotations: Iterable<QueryAnnotation>,
    batchFactor: number
  ): Promise<TRes[]> {
    query = `/*${this.shardName}*/${query}`;
    try {
      const startTime = process.hrtime();
      let error: string | undefined;
      let connID: number | null = null;
      let res: QueryResult | undefined;
      try {
        const conn = await this.poolConnect();
        connID = conn.id ?? 0;
        try {
          const resMulti = (await conn.query(this.sqlPreamble + query)) as
            | QueryResult[]
            | QueryResult;
          if (resMulti instanceof Array) {
            if (resMulti.length > 2) {
              throw Error("Multi-queries are not allowed by SQLClient");
            }

            res = resMulti[1]; // skip search_path preamble
          } else {
            res = resMulti;
          }
        } finally {
          this.poolRelease(conn);
        }

        if (!res.rows) {
          throw Error("Unsupported response from query");
        }

        return res.rows;
      } catch (e: any) {
        error = "" + e;
        throw e;
      } finally {
        this.loggers.clientQueryLogger?.(
          annotations,
          "" + connID,
          op,
          this.shardName,
          table,
          batchFactor,
          query,
          res ? res.rows : undefined,
          toFloatMs(process.hrtime(startTime)),
          error,
          this.isMaster
        );
      }
    } catch (origError) {
      if (origError instanceof Error && (origError as any).severity) {
        // Only wrap the errors which PG sent to us explicitly. Those errors
        // mean that there was some aborted transaction.
        throw new SQLError(origError, this.name, query.trim());
      } else {
        // Some other error (hard to reproduce; possibly a connection error?).
        throw origError;
      }
    }
  }

  async shardNos(): Promise<readonly number[]> {
    try {
      // e.g. sh0000, sh0123 and not e.g. sh1 or sh12345678
      const rows = await this.query<Partial<Record<string, string>>>(
        this.dest.shards.discoverQuery,
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
      // miss some shards (and other shards will work).
      logGlobalError("shardNos()", e);
      return [];
    }
  }

  shardNoByID(id: string): number {
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
      sqlPreamble: `SET search_path TO ${this.buildShardName(no)}; `,
    });
  }

  override prewarm() {
    if (!this.dest.config.min) {
      return;
    }

    const toPrewarm = this.dest.config.min - this.pool.waitingCount;
    if (toPrewarm > 0) {
      Array.from(Array(toPrewarm).keys()).forEach(
        // This may be slow: full-text dictionaries initialization is slow, and
        // also the 1st query in a pg-pool connection is slow.
        () =>
          runInVoid(
            this.pool
              .query("SELECT 'word' @@ plainto_tsquery('english', 'word')")
              .catch((e) => logGlobalError("SQLClientPool prewarm", e))
          )
      );
    }

    setTimeout(() => this.prewarm(), PREWARM_INTERVAL_MS);
  }

  private buildShardName(no: number | string) {
    // e.g. "sh%04d" -> "sh0042"
    return this.dest.shards.nameFormat.replace(
      /%(0?)(\d+)[sd]/,
      (_, zero: string, d: string) =>
        no.toString().padStart(zero ? parseInt(d) : 0, "0")
    );
  }

  private async poolConnect() {
    return this.pool.connect() as Promise<PoolClientX>;
  }

  private poolRelease(conn: PoolClientX) {
    const needClose = conn.closeAt && Date.now() > conn.closeAt;
    conn.release(needClose as any);
  }
}

function logGlobalError(where: string, e: any) {
  // eslint-disable-next-line no-console
  console.log(`SQLClient: ${where}: ${e}`);
}
