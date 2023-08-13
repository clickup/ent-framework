import compact from "lodash/compact";
import { types } from "pg";
import { Client } from "../../abstract/Client";
import { Cluster } from "../../abstract/Cluster";
import { MASTER } from "../../abstract/Shard";
import type { TimelineManager } from "../../abstract/TimelineManager";
import { GLOBAL_SHARD, type ShardAffinity } from "../../ent/Configuration";
import { join, mapJoin, nullthrows } from "../../helpers/misc";
import buildShape from "../helpers/buildShape";
import type { SQLClient } from "../SQLClient";
import { escapeLiteral, escapeIdent } from "../SQLClient";
import { SQLClientPool } from "../SQLClientPool";

/**
 * A proxy for an SQLClient which records all the queries passing through and
 * has some other helper methods.
 */
export class TestSQLClient extends Client implements Pick<SQLClient, "query"> {
  readonly queries: string[] = [];

  constructor(public readonly client: SQLClient) {
    super("test", client.isMaster, client.loggers);
  }

  get shardName(): string {
    return this.client.shardName;
  }

  get timelineManager(): TimelineManager {
    return this.client.timelineManager;
  }

  async end(forceDisconnect?: boolean): Promise<void> {
    return this.client.end(forceDisconnect);
  }

  async query<TRes>(
    params: Parameters<SQLClient["query"]>[0]
  ): Promise<TRes[]> {
    this.queries.push(escapeLiteral(params.query));
    return this.client.query<TRes>(params);
  }

  async shardNos(): Promise<readonly number[]> {
    return this.client.shardNos();
  }

  shardNoByID(id: string): number {
    return this.client.shardNoByID(id);
  }

  withShard(no: number): this {
    return new TestSQLClient(this.client.withShard(no)) as this;
  }

  toMatchSnapshot(): void {
    expect(
      this.queries
        .map(
          (query) =>
            "\n" +
            indentQuery(query) +
            "\n----\n" +
            indentQuery(buildShape(query)) +
            "\n"
        )
        .join("")
    ).toMatchSnapshot();

    this.resetSnapshot();
  }

  resetSnapshot(): void {
    this.queries.length = 0;
  }

  async rows(sql: string, ...values: any[]): Promise<any[]> {
    sql = sql.replace(/%T/g, (_) => escapeIdent(values.shift()));
    return nullthrows(
      await this.client.query<any>({
        query: [sql, ...values],
        isWrite: true, // because used for BOTH read and write queries in tests
        annotations: [],
        op: "",
        table: "",
      })
    );
  }
}

/**
 * A custom type example.
 */
export class EncryptedValue {
  static dbValueToJs(dbValue: string): EncryptedValue {
    return new this(dbValue);
  }

  static stringify(obj: EncryptedValue): string {
    return obj.dbValue;
  }

  static parse(str: string): EncryptedValue {
    return new this(str);
  }

  static async encrypt(text: string, delta: number): Promise<EncryptedValue> {
    return new this(
      "encrypted:" +
        text
          .split("")
          .map((c) => String.fromCharCode(c.charCodeAt(0) + delta))
          .join("")
    );
  }

  async decrypt(delta: number): Promise<string> {
    return this.dbValue
      .replace("encrypted:", "")
      .split("")
      .map((c) => String.fromCharCode(c.charCodeAt(0) - delta))
      .join("");
  }

  private constructor(private dbValue: string) {}
}

/**
 * Another custom type which maps a JS Buffer to PG "bytea" native type.
 */
export class ByteaBuffer {
  static dbValueToJs(dbValue: Buffer): Buffer {
    // Node-postgres returns "bytea" values as Buffer already.
    return dbValue;
  }

  static stringify(jsValue: Buffer): string {
    // PG's representation: '\xDEADBEEF'
    return "\\x" + jsValue.toString("hex");
  }

  static parse(str: string): Buffer {
    return types.getTypeParser(types.builtins.BYTEA)(str);
  }
}

/**
 * A SQL client config we use in tests.
 */
export const testConfig = {
  host: process.env.PGHOST || process.env.DB_HOST_DEFAULT,
  port: parseInt(process.env.PGPORT || process.env.DB_PORT || "5432"),
  database: process.env.PGDATABASE || process.env.DB_DATABASE,
  user: process.env.PGUSER || process.env.DB_USER,
  password: process.env.PGPASSWORD || process.env.DB_PASS,
};

/**
 * Test cluster backed by the test config.
 */
export const testCluster = new Cluster({
  islands: [{ no: 0, nodes: [testConfig, testConfig] }],
  createClient: (isMaster, config) =>
    new TestSQLClient(
      new SQLClientPool({
        name: "test-pool",
        shards: {
          nameFormat: "sh%04d",
          discoverQuery:
            "SELECT nspname FROM pg_namespace WHERE nspname ~ 'sh[0-9]+'",
        },
        isMaster,
        config,
        loggers: { swallowedErrorLogger: () => {} },
      })
    ),
});

/**
 * Recreates the test tables on the test cluster.
 */
export async function recreateTestTables(
  EntClasses: Array<{
    CREATE: string[];
    SCHEMA: { name: string };
    SHARD_AFFINITY: ShardAffinity<any>;
  }>,
  tableInverse?: string
): Promise<void> {
  await mapJoin(
    [testCluster.globalShard(), ...(await testCluster.nonGlobalShards())],
    async (shard) => {
      const master = await shard.client(MASTER);
      await mapJoin(
        compact([
          tableInverse,
          ...EntClasses.map((EntClass) => EntClass.SCHEMA.name),
        ]),
        async (table) => master.rows("DROP TABLE IF EXISTS %T CASCADE", table)
      );
      await join([
        tableInverse &&
          master.rows(
            `CREATE TABLE %T(
              id bigint NOT NULL PRIMARY KEY,
              id1 bigint,
              type varchar(32) NOT NULL,
              id2 bigint NOT NULL,
              created_at timestamptz NOT NULL DEFAULT now(),
              UNIQUE(type, id1, id2)
            )`,
            tableInverse
          ),
        mapJoin(EntClasses, async (EntClass) => {
          if ((EntClass.SHARD_AFFINITY === GLOBAL_SHARD) === (shard.no === 0)) {
            for (const sql of EntClass.CREATE) {
              await master.rows(
                sql,
                EntClass.SCHEMA.name,
                EntClass.SCHEMA.name,
                EntClass.SCHEMA.name
              );
            }
          }
        }),
      ]);
    }
  );
}

function indentQuery(query: string): string {
  query = query
    .replace(/\d{4}-\d{2}-\d{2}T[^']+/g, "<date>")
    .replace(/(?<=[':])[A-Za-z0-9+/]{27}='/g, "<hash>'")
    .replace(/'k\d+'/g, "'<key>'")
    .replace(/\d{16,}/g, (m) =>
      m === Number.MAX_SAFE_INTEGER.toString() ? m : "<id>"
    )
    .replace(/ id AS id/g, " id")
    .replace(/( AS k)\d+/g, "$1*");

  // Beautify single-lined SQL queries.
  if (query.match(/^\(?SELECT/)) {
    query = query
      .replace(/\s+(WHERE|ORDER|LIMIT)/g, "\n  $1")
      .replace(/\s+(AND|OR)/g, "\n    $1");
  }

  // Make the order of rows in UPDATE clause static (to avoid flaky tests); the
  // framework orders the rows by ID typically.
  if (query.match(/^(WITH.*\(VALUES\n.*?\n)(.*?)(\)\n\s*UPDATE.*)/s)) {
    query =
      RegExp.$1 +
      RegExp.$2
        .split(",\n")
        .sort()
        .map((s) => `${s}<reordered for test>`)
        .join(",\n") +
      RegExp.$3;
  }

  return query;
}
