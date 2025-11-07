import delay from "delay";
import pDefer from "p-defer";
import waitForExpect from "wait-for-expect";
import { STALE_REPLICA } from "../../abstract/Shard";
import { PgSchema } from "../PgSchema";
import {
  TEST_CONFIG,
  TEST_ISLANDS,
  reconfigureToTwoIslands,
  recreateTestTables,
  shardRun,
  testCluster,
} from "./test-utils";

jest.useFakeTimers({ advanceTimers: true });

const TEST_ID = "100001234";

const schema = new PgSchema(
  'pg-schema.islands-reconfig"table',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  [],
);

beforeEach(async () => {
  testCluster.options.runOnShardErrorRetryCount = 1;
  testCluster.options.shardsDiscoverIntervalMs = 20000; // very large intentionally
  testCluster.options.reloadIslandsIntervalMs = 10;
  testCluster.options.clientEndDelayMs = 0;

  testCluster.options.islands = TEST_ISLANDS;
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

test("node added dynamically appears in the cluster, old client is removed", async () => {
  const oldIsland0 = await testCluster.island(0);
  const oldIsland0Shards = oldIsland0.shards();
  const oldMaster0 = oldIsland0.master(); // will be reused
  const oldReplica0 = oldIsland0.replica(); // will disappear

  await reconfigureToTwoIslands();

  await delay(1);
  expect(oldMaster0.isEnded()).toBeFalsy();
  expect(oldReplica0.isEnded()).toBeTruthy();

  const newIsland0 = await testCluster.island(0);
  const newIsland1 = await testCluster.island(1);
  const newMaster0 = newIsland0.master();
  const newMaster1 = newIsland1.master();
  expect(newMaster0).toBe(oldMaster0);
  expect(newMaster1).not.toBe(newMaster0);

  expect(newIsland0.shards()).toEqual([]);
  expect(newIsland1.shards()).toEqual(oldIsland0Shards);
});

test("shard client changes when cluster is reconfigured", async () => {
  const oldShard0Replica = await testCluster
    .shard(TEST_ID)
    .client(STALE_REPLICA);
  await reconfigureToTwoIslands();
  const newShard0Replica = await testCluster
    .shard(TEST_ID)
    .client(STALE_REPLICA);
  expect(newShard0Replica).not.toBe(oldShard0Replica);
});

test("when old client is returned to the shard code, but then ended, the operation is retried", async () => {
  const shard = await testCluster.randomShard();

  const oldReplica = await shard.client(STALE_REPLICA);
  const oldReplicaQueryCalledDefer = pDefer();
  const oldReplicaQueryUnfreezeDefer = pDefer();
  jest.spyOn(oldReplica, "query").mockImplementationOnce(async (...args) => {
    oldReplicaQueryCalledDefer.resolve();
    await delay(1);
    expect(oldReplica.isEnded()).toBeFalsy();
    await oldReplicaQueryUnfreezeDefer.promise;
    await delay(1);
    expect(oldReplica.isEnded()).toBeTruthy();
    return oldReplica.query(...args);
  });
  const promise = shardRun(shard, schema.select({ where: {}, limit: 1 }));
  await oldReplicaQueryCalledDefer.promise;

  testCluster.options.islands = () => [
    {
      no: 0,
      nodes: [
        TEST_CONFIG,
        {
          ...TEST_CONFIG,
          isAlwaysLaggingReplica: true,
          nameSuffix: "modified",
        },
      ],
    },
  ];
  await testCluster.rediscover();

  // By this time, Client#query() is called for an already ended Client, and
  // it's frozen till oldReplicaQueryUnfreezeDefer is resolved. Sharded calls
  // should be retried, so a new replica Client should be chosen internally.
  const replicaQuerySpy = jest.spyOn(
    await shard.client(STALE_REPLICA),
    "query",
  );
  oldReplicaQueryUnfreezeDefer.resolve();
  await promise;
  expect(replicaQuerySpy).toBeCalledTimes(1);
});

test("low level (non-sharded) client queries are not retried if the client is ended", async () => {
  const island = await testCluster.island(0);
  const oldReplica = island.replica();

  const clientEndLoggerSpy = jest.spyOn(
    testCluster.options.loggers,
    "clientEndLogger",
  );
  testCluster.options.islands = () => [
    { no: 0, nodes: [TEST_CONFIG, { ...TEST_CONFIG, nameSuffix: "modified" }] },
  ];
  await testCluster.rediscover();

  expect(clientEndLoggerSpy).toBeCalled();
  await waitForExpect(() => expect(oldReplica.isEnded()).toBeTruthy());
  await expect(
    oldReplica.query({
      query: ["SELECT 1"],
      isWrite: false,
      annotations: [],
      op: "test",
      table: "test",
    }),
  ).rejects.toThrow(/ended/);
});
