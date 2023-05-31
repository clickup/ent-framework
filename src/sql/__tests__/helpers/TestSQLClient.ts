import { Client } from "../../../abstract/Client";
import { Cluster } from "../../../abstract/Cluster";
import type { TimelineManager } from "../../../abstract/TimelineManager";
import { nullthrows } from "../../../helpers/misc";
import buildShape from "../../helpers/buildShape";
import type { SQLClient } from "../../SQLClient";
import { escapeIdent, escapeString } from "../../SQLClient";
import { SQLClientPool } from "../../SQLClientPool";

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
    this.queries.push(params.query);
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

  async rows(query: string, ...values: any[]): Promise<any[]> {
    query = query.replace(/%T/g, (_) => escapeIdent(values.shift()));
    query = query.replace(/\?/g, (_) => escapeString(values.shift()));
    return nullthrows(
      await this.client.query<any>({
        query,
        isWrite: true, // because used for BOTH read and write queries in tests
        annotations: [],
        op: "",
        table: "",
      })
    );
  }
}

export const testConfig = {
  host: process.env.PGHOST || process.env.DB_HOST_DEFAULT,
  port: parseInt(process.env.PGPORT || process.env.DB_PORT || "5432"),
  database: process.env.PGDATABASE || process.env.DB_DATABASE,
  user: process.env.PGUSER || process.env.DB_USER,
  password: process.env.PGPASSWORD || process.env.DB_PASS,
};

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
  locateIslandErrorRetryCount: 30,
  locateIslandErrorRetryDelayMs: 1000,
});

function indentQuery(query: string): string {
  query = query
    .replace(/\d{4}-\d{2}-\d{2}T[^']+/g, "<date>")
    .replace(/'[A-Za-z0-9+/]{27}='/g, "'<hash>'")
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
