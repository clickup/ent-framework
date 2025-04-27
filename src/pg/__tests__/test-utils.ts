import type { AddressInfo, Server, Socket } from "net";
import { connect, createServer } from "net";
import delay from "delay";
import compact from "lodash/compact";
import type { PoolConfig } from "pg";
import waitForExpect from "wait-for-expect";
import type {
  ClientConnectionIssue,
  ClientPingInput,
  ClientRole,
} from "../../abstract/Client";
import { Client } from "../../abstract/Client";
import { Cluster } from "../../abstract/Cluster";
import type { Loggers } from "../../abstract/Loggers";
import type { Query } from "../../abstract/Query";
import type { STALE_REPLICA, Shard } from "../../abstract/Shard";
import { MASTER } from "../../abstract/Shard";
import { Timeline } from "../../abstract/Timeline";
import type { TimelineManager } from "../../abstract/TimelineManager";
import { GLOBAL_SHARD } from "../../ent/ShardAffinity";
import { join, mapJoin, nullthrows, runInVoid } from "../../internal/misc";
import type { Literal } from "../../types";
import { buildShape } from "../helpers/buildShape";
import { escapeIdent } from "../helpers/escapeIdent";
import { escapeLiteral } from "../helpers/escapeLiteral";
import type { PgClient, PgClientConn } from "../PgClient";
import type { PgClientPoolOptions } from "../PgClientPool";
import { PgClientPool } from "../PgClientPool";

/**
 * A proxy for an PgClient which records all the queries passing through and
 * has some other helper methods.
 */
export class TestPgClient
  extends Client
  implements Pick<PgClient, "query" | "options" | "acquireConn">
{
  readonly queries: string[] = [];
  override readonly options: Required<PgClientPoolOptions>;

  constructor(public readonly client: PgClientPool) {
    super(client.options);
    this.options = client.options;
  }

  get shardName(): string {
    return this.client.shardName;
  }

  get timelineManager(): TimelineManager {
    return this.client.timelineManager;
  }

  async acquireConn(): Promise<PgClientConn> {
    return this.client.acquireConn();
  }

  address(): string {
    return this.client.address();
  }

  async end(): Promise<void> {
    return this.client.end();
  }

  async shardNos(): Promise<readonly number[]> {
    return this.client.shardNos();
  }

  async ping(input: ClientPingInput): Promise<void> {
    return this.client.ping(input);
  }

  shardNoByID(id: string): number {
    return this.client.shardNoByID(id);
  }

  withShard(no: number): this {
    return new TestPgClient(this.client.withShard(no)) as this;
  }

  isEnded(): boolean {
    return this.client.isEnded();
  }

  role(): ClientRole {
    return this.client.role();
  }

  connectionIssue(): ClientConnectionIssue | null {
    return this.client.connectionIssue();
  }

  async query<TRes>(params: Parameters<PgClient["query"]>[0]): Promise<TRes[]> {
    this.queries.push(
      escapeLiteral(params.query) +
        (params.hints && Object.keys(params.hints).length > 0
          ? "\n-- Hints:" +
            Object.entries(params.hints)
              .map(([k, v]) => `${k || '""'}=${v}`)
              .join(",")
          : ""),
    );
    return this.client.query<TRes>(params);
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
            "\n",
        )
        .join(""),
    ).toMatchSnapshot();

    this.resetSnapshot();
  }

  resetSnapshot(): void {
    this.queries.length = 0;
  }

  async rows(
    sql: string,
    ...values: Literal
  ): Promise<Array<Record<string, unknown>>> {
    sql = sql.replace(/%T/g, (_) => escapeIdent("" + values.shift()));
    return nullthrows(
      await this.client.query({
        query: [sql, ...values],
        isWrite: true, // because used for BOTH read and write queries in tests
        annotations: [],
        op: "",
        table: "",
      }),
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
          .join(""),
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
 * A simple PGBouncer simulation to test connection issues.
 */
export class TCPProxyServer {
  private connections = new Set<Socket>();
  private server: Server;
  private port?: number;

  constructor({
    host,
    port,
    delayOnConnect,
  }: {
    host: string;
    port: number;
    delayOnConnect?: number;
  }) {
    this.server = createServer((socket) => {
      this.connections.add(socket);
      socket.once("close", () => this.connections.delete(socket));
      runInVoid(
        delay(delayOnConnect ?? 0).then(() =>
          socket.pipe(connect(port, host)).pipe(socket),
        ),
      );
    });
    this.listen();
  }

  async abortConnections(): Promise<void> {
    this.connections.forEach((socket) => socket.destroy());
    await waitForExpect(() => expect(this.connections.size).toEqual(0));
  }

  async destroy(): Promise<void> {
    this.server.close();
    await this.abortConnections();
  }

  resurrectOnSamePort(): void {
    this.listen(this.port);
  }

  async waitForAtLeastConnections(n: number): Promise<void> {
    await waitForExpect(() =>
      expect(this.connections.size).toBeGreaterThanOrEqual(n),
    );
  }

  connectionCount(): number {
    return this.connections.size;
  }

  address(): AddressInfo {
    return this.server.address() as AddressInfo;
  }

  private listen(port?: number): void {
    this.server.listen(port);
    this.port = this.address().port;
  }
}

/**
 * A node-postgres config we use in tests.
 */
export const TEST_CONFIG: PoolConfig & {
  nameSuffix: string | undefined;
  isAlwaysLaggingReplica: boolean;
  loggers: Loggers;
} = {
  host: process.env["PGHOST"] || process.env["DB_HOST_DEFAULT"],
  port:
    parseInt(process.env["PGPORT"] || process.env["DB_PORT"] || "0") ||
    undefined,
  database: process.env["PGDATABASE"] || process.env["DB_DATABASE"],
  user: process.env["PGUSER"] || process.env["DB_USER"],
  password: process.env["PGPASSWORD"] || process.env["DB_PASS"],
  // Additional custom props (tests facilities).
  nameSuffix: undefined,
  isAlwaysLaggingReplica: false,
  loggers: {
    swallowedErrorLogger: jest.fn(),
    clientQueryLogger: jest.fn(),
    locateIslandErrorLogger: jest.fn(),
  },
};

/**
 * An initial test list of Islands to start from.
 */
export const TEST_ISLANDS = [
  {
    no: 0,
    nodes: [TEST_CONFIG, { ...TEST_CONFIG, isAlwaysLaggingReplica: true }],
  },
];

/**
 * A stub value for QueryAnnotation.
 */
export const TEST_ANNOTATION = {
  trace: "some-trace",
  debugStack: "",
  vc: "some-vc",
  whyClient: undefined,
  attempt: 0,
};

/**
 * A stub Timeline used in shardRun() helper.
 */
export const TEST_TIMELINE = new Timeline();

beforeEach(() => {
  TEST_TIMELINE.reset();
});

/**
 * Test Cluster backed by the test config.
 */
export const testCluster = new Cluster({
  shardsDiscoverIntervalMs: 500,
  shardsDiscoverIntervalJitter: 0.01,
  islands: TEST_ISLANDS,
  createClient: ({ nameSuffix, isAlwaysLaggingReplica, loggers, ...config }) =>
    new TestPgClient(
      new PgClientPool({
        name:
          `test-pool(replica=${isAlwaysLaggingReplica})` +
          (nameSuffix ? `-${nameSuffix}` : ""),
        loggers,
        ...(isAlwaysLaggingReplica
          ? { role: "replica", maxReplicationLagMs: 1e10 }
          : {}),
        shards: {
          nameFormat: "sh%04d",
          discoverQuery:
            "SELECT nspname FROM pg_namespace WHERE nspname ~ 'sh[0-9]+'",
        },
        config,
      }),
    ),
  loggers: {
    swallowedErrorLogger: jest.fn(),
    clientQueryLogger: jest.fn(),
    locateIslandErrorLogger: jest.fn(),
  },
});

/**
 * Recreates the test tables on the test Cluster.
 */
export async function recreateTestTables(
  EntClasses: Array<{
    CREATE: string[];
    SCHEMA: { name: string };
    SHARD_AFFINITY: typeof GLOBAL_SHARD | readonly string[];
  }>,
  tableInverse?: string,
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
        async (table) => master.rows("DROP TABLE IF EXISTS %T CASCADE", table),
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
            tableInverse,
          ),
        mapJoin(EntClasses, async (EntClass) => {
          if ((EntClass.SHARD_AFFINITY === GLOBAL_SHARD) === (shard.no === 0)) {
            for (const sql of EntClass.CREATE) {
              await master.rows(
                sql,
                EntClass.SCHEMA.name,
                EntClass.SCHEMA.name,
                EntClass.SCHEMA.name,
              );
            }
          }
        }),
      ]);
    },
  );
}

/**
 * A shortcut helper to run a query against a Shard.
 */
export async function shardRun<TOutput>(
  shard: Shard<TestPgClient>,
  query: Query<TOutput>,
  freshness: typeof STALE_REPLICA | null = null,
): Promise<TOutput> {
  return shard.run(query, TEST_ANNOTATION, TEST_TIMELINE, freshness);
}

/**
 * Reconfigures the Cluster to have 2 Islands, where both Island 0 and Island 1
 * has 1 master node each.
 */
export async function reconfigureToTwoIslands(): Promise<void> {
  // Since we add the same physical host to island 1 as we already have in
  // island 0, we force the old Client to discover 0 shards to avoid "Shard
  // exists in more than one island" error.
  const oldIsland0 = await testCluster.island(0);
  const oldMaster0 = oldIsland0.master(); // will be reused
  jest.spyOn(oldMaster0, "shardNos").mockResolvedValue([]);

  testCluster.options.islands = () => [
    { no: 0, nodes: [TEST_CONFIG] },
    { no: 1, nodes: [{ ...TEST_CONFIG, nameSuffix: "island1" }] },
  ];
  await testCluster.rediscover();
}

function indentQuery(query: string): string {
  query = query
    .replace(/\d{4}-\d{2}-\d{2}T[^']+/g, "<date>")
    .replace(/(?<=[':])[a-f0-9]{40}'/g, "<hash>'")
    .replace(/'k\d+'/g, "'<key>'")
    .replace(/\d{16,}/g, (m) =>
      m === Number.MAX_SAFE_INTEGER.toString() ? m : "<id>",
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
