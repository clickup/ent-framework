import { Client } from "../../../abstract/Client";
import { Cluster, Island } from "../../../abstract/Cluster";
import { QueryAnnotation } from "../../../abstract/QueryAnnotation";
import { nullthrows } from "../../../helpers";
import { escapeIdent, escapeString, SQLClient } from "../../SQLClient";
import { SQLClientPool } from "../../SQLClientPool";

/**
 * A proxy for an SQLClient which records all the queries
 * passing through and has some other helper methods.
 */
export class TestSQLClient extends Client implements SQLClient {
  readonly queries: string[] = [];

  constructor(private client: SQLClient) {
    super("test", client.isMaster, client.loggers);
  }

  async query<TRes>(
    query: string,
    op: string,
    table: string,
    annotations: Iterable<QueryAnnotation>,
    batchFactor: number
  ): Promise<TRes[]> {
    this.queries.push(query);
    const res = await this.client.query<TRes>(
      query,
      op,
      table,
      annotations,
      batchFactor
    );
    return res;
  }

  xid() {
    return this.client.xid();
  }

  async shardNos() {
    return this.client.shardNos();
  }

  shardNoByID(id: string) {
    return this.client.shardNoByID(id);
  }

  withShard(no: number): this {
    return new TestSQLClient(this.client.withShard(no)) as this;
  }

  get shardName() {
    return this.client.shardName;
  }

  toMatchSnapshot() {
    expect(
      this.queries
        .map((query) => {
          query = query
            .replace(/\d{4}-\d{2}-\d{2}T[^']+/g, "<date>")
            .replace(/'[A-Za-z0-9+/]{27}='/g, "'<hash>'")
            .replace(/'k\d+'/g, "'<key>'")
            .replace(/\d{16,}/g, "<id>");

          // Beautify single-lined SQL queries.
          if (query.match(/^\(?SELECT/)) {
            query = query
              .replace(/\s+(WHERE|ORDER|LIMIT)/g, "\n  $1")
              .replace(/\s+(AND|OR)/g, "\n    $1");
          }

          // Make the order of rows in UPDATE clause static (to avoid flaky
          // tests); the framework orders the rows by ID typically
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
        })
        .join("\n\n")
    ).toMatchSnapshot();
    this.resetSnapshot();
  }

  resetSnapshot() {
    this.queries.length = 0;
  }

  async rows(query: string, ...values: any[]): Promise<any[]> {
    query = query.replace(/%T/g, (_) => escapeIdent(values.shift()));
    query = query.replace(/\?/g, (_) => escapeString(values.shift()));
    return nullthrows(await this.client.query<any>(query, "", "", [], 1));
  }
}

const master = new SQLClientPool(
  {
    name: "test-pool",
    shards: {
      nameFormat: "sh%04d",
      discoverQuery:
        "SELECT nspname FROM pg_namespace WHERE nspname ~ 'sh[0-9]+'",
    },
    isMaster: true,
    config: {
      host: process.env.DB_HOST_DEFAULT || process.env.PGHOST,
      database: process.env.DB_DATABASE || process.env.PGDATABASE,
      user: process.env.DB_USER || process.env.PGUSER,
      password: process.env.DB_PASS || process.env.PGPASSWORD,
    },
  },
  {}
);

export const testCluster = new Cluster(
  2, // numReadShards,
  2, // numWriteShards,
  new Map([
    [
      0,
      new Island(new TestSQLClient(master), [
        new TestSQLClient(
          new SQLClientPool({ ...master.dest, isMaster: false }, master.loggers)
        ),
      ]),
    ],
  ])
);
