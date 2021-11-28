import { Pool, PoolClient, PoolConfig, QueryResult } from "pg";
import { Client, Loggers } from "../abstract/Client";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { runInVoid, sanitizeIDForDebugPrinting, toFloatMs } from "../helpers";
import { SQLClient } from "./SQLClient";
import { SQLError } from "./SQLError";

const DEFAULT_MAX_REPLICATION_LAG_MS = 3000;
const DEFAULT_PREWARM_INTERVAL_MS = 10000;
const DEFAULT_MAX_CONN_LIFETIME_JITTER = 0.2;

export interface SQLClientDest {
  name: string;
  shards: {
    nameFormat: string;
    discoverQuery: string;
  };
  isMaster: boolean;
  config: PoolConfig & {
    maxConnLifetimeMs?: number;
    maxConnLifetimeJitter?: number;
    maxReplicationLagMs?: number;
    prewarmIntervalMs?: number;
  };
}

// Our extension to Pool connection which adds a couple props to the connection
// in on("connect") handler (persistent for the same connection objects, i.e.
// across queries in the same connection).
type PoolClientX = PoolClient & {
  id?: number;
  closeAt?: number;
};

export class SQLClientPool extends Client implements SQLClient {
  readonly shardName = "public";

  private pool: Pool;
  private shardNoPadLen: number;
  private maxReplicationLagNano: bigint;
  private lastQuery = {
    transactionTimestamp: new Date(),
    clockTimestamp: new Date(),
    lastReplayTimestamp: new Date(),
    localStartHrtime: process.hrtime.bigint(),
    localEndHrtime: process.hrtime.bigint(),
  };

  constructor(public readonly dest: SQLClientDest, loggers: Loggers) {
    super(dest.name, dest.isMaster, loggers);

    this.shardNoPadLen = this.buildShardName(0).match(/(\d+)/)
      ? RegExp.$1.length
      : 0;
    if (!this.shardNoPadLen) {
      throw Error("Invalid shards.nameFormat value");
    }

    this.maxReplicationLagNano =
      BigInt(
        dest.config.maxReplicationLagMs ?? DEFAULT_MAX_REPLICATION_LAG_MS
      ) * BigInt(1e6);

    this.pool = new Pool(dest.config)
      .on("connect", (conn: PoolClientX) => {
        conn.id = connNo++;
        conn.closeAt = dest.config.maxConnLifetimeMs
          ? Date.now() +
            dest.config.maxConnLifetimeMs *
              (1 +
                (dest.config.maxConnLifetimeJitter ??
                  DEFAULT_MAX_CONN_LIFETIME_JITTER) *
                  Math.random())
          : undefined;
      })
      .on("error", (e) => {
        // Having this hook prevents node from crashing.
        logGlobalError("SQLClientPool", e);
      });
  }

  sessionPos(): bigint {
    // TODO: implement real xlog position fetching
    return this.dest.isMaster
      ? process.hrtime.bigint()
      : process.hrtime.bigint() - this.maxReplicationLagNano;
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
          // A good and simple explanation of the protocol is here:
          // https://www.postgresql.org/docs/13/protocol-flow.html. In short, we
          // can't use prepared-statement-based operations even theoretically,
          // because this mode doesn't support multi-queries. Also notice that
          // TS typing is doomed for multi-queries:
          // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/33297
          const localStartHrtime = process.hrtime.bigint();
          const resMulti: [
            QueryResult<never>,
            QueryResult,
            QueryResult<{
              transaction_timestamp: Date;
              clock_timestamp: Date;
              pg_last_xact_replay_timestamp: Date | null;
            }>
          ] = (await conn.query(
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
              query,
              "SELECT transaction_timestamp(), clock_timestamp(), pg_last_xact_replay_timestamp()",
            ].join("; ")
          )) as any;

          if (resMulti.length > 3) {
            throw Error(
              `Multi-query (with semicolons) is not allowed as an input to SQLClient.query(); got ${query}`
            );
          }

          const timestamps = resMulti[2].rows[0];
          this.lastQuery = {
            transactionTimestamp: timestamps.transaction_timestamp,
            clockTimestamp: timestamps.clock_timestamp,
            lastReplayTimestamp:
              timestamps.pg_last_xact_replay_timestamp ??
              timestamps.transaction_timestamp,
            localStartHrtime,
            localEndHrtime: process.hrtime.bigint(),
          };

          res = resMulti[1];
        } finally {
          this.poolRelease(conn);
        }
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

      return res.rows;
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

    setTimeout(
      () => this.prewarm(),
      this.dest.config.prewarmIntervalMs ?? DEFAULT_PREWARM_INTERVAL_MS
    );
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

let connNo = 1;

function logGlobalError(where: string, e: any) {
  // eslint-disable-next-line no-console
  console.log(`SQLClient: ${where}: ${e}`);
}
