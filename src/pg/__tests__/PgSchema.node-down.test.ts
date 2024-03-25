import waitForExpect from "wait-for-expect";
import { ClientError } from "../../abstract/ClientError";
import { type Shard } from "../../abstract/Shard";
import { maybeCall } from "../../internal/misc";
import { PgSchema } from "../PgSchema";
import type { TestPgClient } from "./test-utils";
import {
  TCPProxyServer,
  TEST_CONFIG,
  recreateTestTables,
  shardRun,
  testCluster,
} from "./test-utils";

jest.useFakeTimers({ advanceTimers: true });

const schema = new PgSchema(
  'pg-schema.node-down"table',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  [],
);

let shard: Shard<TestPgClient>;
let proxyServer: TCPProxyServer;

beforeEach(async () => {
  testCluster.options.locateIslandErrorRetryCount = 1;
  testCluster.options.locateIslandErrorRediscoverClusterDelayMs = 10000;
  testCluster.options.shardsDiscoverRecheckIslandsIntervalMs = 10;
  testCluster.options.shardsDiscoverIntervalMs = 100000;

  shard = await testCluster.randomShard();

  proxyServer = new TCPProxyServer({
    host: TEST_CONFIG.host!,
    port: TEST_CONFIG.port!,
  });
  const proxyTestConfig = {
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
});

afterEach(async () => {
  await proxyServer.destroy();
});

test("chooses another replica if new connection can't be opened", async () => {
  await proxyServer.destroy();
  const promise = shardRun(shard, schema.select({ where: {}, limit: 1 }));

  jest.advanceTimersByTime(
    maybeCall(testCluster.options.locateIslandErrorRediscoverClusterDelayMs) *
      1.5,
  );
  await waitForExpect(() =>
    expect(
      "" +
        jest.mocked(testCluster.options.loggers.locateIslandErrorLogger!).mock
          .lastCall?.[0].error,
    ).toContain("ECONNREFUSED"),
  );

  await jest.advanceTimersByTimeAsync(
    maybeCall(testCluster.options.locateIslandErrorRediscoverClusterDelayMs) *
      3,
  );
  await promise;
});

test("retries on another replica if connection is aborted mid-query", async () => {
  const island0 = await testCluster.island(0);
  const replica = island0.replica();
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
  expect(error).toBeInstanceOf(ClientError);
  expect((error as ClientError).postAction).toEqual("choose-another-client");
});
