import delay from "delay";
import waitForExpect from "wait-for-expect";
import { MASTER, type Shard } from "../../abstract/Shard";
import { maybeCall, runInVoid } from "../../helpers/misc";
import { escapeIdent } from "../SQLClient";
import { SQLSchema } from "../SQLSchema";
import type { TestSQLClient } from "./test-utils";
import {
  TEST_CONFIG,
  recreateTestTables,
  shardRun,
  testCluster,
  TCPProxyServer,
} from "./test-utils";

jest.useFakeTimers({ advanceTimers: true });

const schema = new SQLSchema(
  'sql-schema.connect-timeout"table',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  []
);

const OLD_ISLANDS = maybeCall(testCluster.options.islands);
const TABLE_BAK = `${schema.name}_bak`;

let shard: Shard<TestSQLClient>;
let connStuckServer: TCPProxyServer;
let connStuckTestConfig: typeof TEST_CONFIG;

const shardsDiscoverRecheckIslandsIntervalMs = 20000; // intentionally large

beforeEach(async () => {
  testCluster.options.locateIslandErrorRetryCount = 2;
  testCluster.options.locateIslandErrorRetryDelayMs = 100;
  testCluster.options.shardsDiscoverRecheckIslandsIntervalMs =
    shardsDiscoverRecheckIslandsIntervalMs;
  testCluster.options.shardsDiscoverIntervalMs = 100000;
  testCluster.options.islands = OLD_ISLANDS;

  await recreateTestTables([
    {
      CREATE: [
        `DROP TABLE IF EXISTS ${escapeIdent(TABLE_BAK)} CASCADE`,
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          name text NOT NULL
        )`,
      ],
      SCHEMA: schema,
      SHARD_AFFINITY: [],
    },
  ]);

  shard = await testCluster.randomShard();

  connStuckServer = new TCPProxyServer({
    host: TEST_CONFIG.host!,
    port: TEST_CONFIG.port!,
    delayOnConnect: 1000000,
  });
  connStuckTestConfig = {
    ...TEST_CONFIG,
    isAlwaysLaggingReplica: true,
    host: connStuckServer.address().address,
    port: connStuckServer.address().port,
    connectionTimeoutMillis: 30000,
  };
});

afterEach(async () => {
  await connStuckServer.destroy();
});

test("when connection gets stuck during background rediscovery, it does not slowdown queries", async () => {
  const errorSpy = jest.spyOn(connStuckTestConfig, "swallowedErrorLogger");
  testCluster.options.islands = [
    { no: 0, nodes: [TEST_CONFIG, connStuckTestConfig] },
  ];

  jest.advanceTimersByTime(shardsDiscoverRecheckIslandsIntervalMs);
  await connStuckServer.waitForAtLeastConnections(1);

  expect(await shardRun(shard, schema.insert({ name: "abc" }))).toBeTruthy();
  expect(errorSpy).not.toBeCalled();

  jest.advanceTimersByTime(connStuckTestConfig.connectionTimeoutMillis!);
  await waitForExpect(() =>
    expect("" + errorSpy.mock.lastCall?.[0].error).toContain("timeout")
  );
  await testCluster.islands();
});

test("when rediscovery is triggered by a failed query, and connection gets stuck, then the query waits until rediscovery finishes", async () => {
  const master = await shard.client(MASTER);
  await master.rows("ALTER TABLE %T RENAME TO %T", schema.name, TABLE_BAK);

  const errorSpy = jest.spyOn(connStuckTestConfig, "swallowedErrorLogger");
  testCluster.options.islands = [
    { no: 0, nodes: [TEST_CONFIG, connStuckTestConfig] },
  ];

  let shardRunResult: unknown = undefined;
  runInVoid(
    shardRun(shard, schema.insert({ name: "abc" }))
      .then(() => (shardRunResult = true))
      .catch((e) => (shardRunResult = e))
  );

  await connStuckServer.waitForAtLeastConnections(1);
  await master.rows("ALTER TABLE %T RENAME TO %T", TABLE_BAK, schema.name);
  await delay(1000);
  expect(shardRunResult).toBeUndefined();

  jest.advanceTimersByTime(connStuckTestConfig.connectionTimeoutMillis!);
  await waitForExpect(() => expect(shardRunResult).toEqual(true));

  expect(errorSpy.mock.calls).toHaveLength(1);
  expect("" + errorSpy.mock.calls[0][0].error).toContain("timeout");
});