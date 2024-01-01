import waitForExpect from "wait-for-expect";
import { STALE_REPLICA, type Shard } from "../../abstract/Shard";
import { ShardError } from "../../abstract/ShardError";
import { maybeCall } from "../../helpers/misc";
import { SQLSchema } from "../SQLSchema";
import type { TestSQLClient } from "./test-utils";
import {
  TCPProxyServer,
  TEST_CONFIG,
  recreateTestTables,
  shardRun,
  testCluster,
} from "./test-utils";

jest.useFakeTimers({ advanceTimers: true });

const schema = new SQLSchema(
  'sql-schema.node-down"table',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  []
);

let shard: Shard<TestSQLClient>;
let proxyServer: TCPProxyServer;
let proxyTestConfig: typeof TEST_CONFIG;

const OLD_ISLANDS = maybeCall(testCluster.options.islands);
const locateIslandErrorRetryDelayMs = 10000;

beforeEach(async () => {
  testCluster.options.locateIslandErrorRetryCount = 1;
  testCluster.options.locateIslandErrorRetryDelayMs =
    locateIslandErrorRetryDelayMs;
  testCluster.options.shardsDiscoverRecheckIslandsIntervalMs = 10;
  testCluster.options.shardsDiscoverIntervalMs = 100000;
  testCluster.options.islands = OLD_ISLANDS;

  await recreateTestTables([
    {
      CREATE: [
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

  proxyServer = new TCPProxyServer({
    host: TEST_CONFIG.host!,
    port: TEST_CONFIG.port!,
  });
  proxyTestConfig = {
    ...TEST_CONFIG,
    isAlwaysLaggingReplica: true,
    host: proxyServer.address().address,
    port: proxyServer.address().port,
    connectionTimeoutMillis: 30000,
  };

  testCluster.options.islands = [
    { no: 0, nodes: [TEST_CONFIG, proxyTestConfig] },
  ];
  await testCluster.rediscover();
});

afterEach(async () => {
  await proxyServer.destroy();
});

test("chooses another replica if new connection can't be opened", async () => {
  await proxyServer.destroy();
  const shardOnRunErrorSpy = jest.spyOn(shard.options, "onRunError");
  const promise = shardRun(shard, schema.select({ where: {}, limit: 1 }));

  jest.advanceTimersByTime(locateIslandErrorRetryDelayMs * 1.5);
  await waitForExpect(() =>
    expect("" + shardOnRunErrorSpy.mock.lastCall?.[1]).toContain("ECONNREFUSED")
  );

  await jest.advanceTimersByTimeAsync(locateIslandErrorRetryDelayMs * 3);
  await promise;
});

test("retries on another replica if connection is aborted mid-query", async () => {
  const replica = await testCluster.islandClient(0, STALE_REPLICA);
  await proxyServer.abortConnections();

  const promise = replica
    .query({
      query: ["SELECT pg_sleep(40000)"],
      isWrite: false,
      annotations: [],
      op: "test",
      table: "test",
    })
    .catch((e) => e);

  await proxyServer.waitForAtLeastConnections(1);
  await proxyServer.abortConnections();

  const error = await promise;
  expect(error).toBeInstanceOf(ShardError);
  expect((error as ShardError).postAction).toEqual("choose-another-client");
});
