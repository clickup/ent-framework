import pDefer from "p-defer";
import waitForExpect from "wait-for-expect";
import { MASTER, STALE_REPLICA } from "../../abstract/Shard";
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
  testCluster.options.locateIslandErrorRetryCount = 1;
  testCluster.options.shardsDiscoverIntervalMs = 20000; // very large intentionally
  testCluster.options.shardsDiscoverRecheckIslandsIntervalMs = 10;

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
  const oldIsland0Shards = await testCluster.islandShards(0);
  const oldMaster0 = await testCluster.islandClient(0, MASTER); // will be reused
  const oldReplica0 = await testCluster.islandClient(0, STALE_REPLICA); // will disappear

  await reconfigureToTwoIslands();

  expect(oldMaster0.isEnded()).toBeFalsy();
  expect(oldReplica0.isEnded()).toBeTruthy();

  const newMaster0 = await testCluster.islandClient(0, MASTER);
  const newMaster1 = await testCluster.islandClient(1, MASTER);
  expect(newMaster0).toBe(oldMaster0);
  expect(newMaster1).not.toBe(newMaster0);

  expect(await testCluster.islandShards(0)).toEqual([]);
  expect(await testCluster.islandShards(1)).toEqual(oldIsland0Shards);
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
  const master = await shard.client(MASTER);
  const oldReplica = await shard.client(STALE_REPLICA);

  const oldReplicaQueryCalledDefer = pDefer();
  const oldReplicaQueryUnfreezeDefer = pDefer();
  jest.spyOn(oldReplica, "query").mockImplementationOnce(async (...args) => {
    oldReplicaQueryCalledDefer.resolve();
    expect(oldReplica.isEnded()).toBeFalsy();
    await oldReplicaQueryUnfreezeDefer.promise;
    expect(oldReplica.isEnded()).toBeTruthy();
    return oldReplica.query(...args);
  });
  const promise = shardRun(shard, schema.select({ where: {}, limit: 1 }));
  await oldReplicaQueryCalledDefer.promise;

  testCluster.options.islands = () => [
    { no: 0, nodes: [TEST_CONFIG, { ...TEST_CONFIG, nameSuffix: "modified" }] },
  ];
  await testCluster.rediscover();

  // By this time, Client#query() is called for an already ended Client, and
  // it's frozen till oldReplicaQueryUnfreezeDefer is resolved. Sharded calls
  // should be retried, so a new Client should be chosen internally.
  const masterQuerySpy = jest.spyOn(master, "query");
  oldReplicaQueryUnfreezeDefer.resolve();
  await promise;
  expect(masterQuerySpy).toBeCalledTimes(1);
});

test("low level (non-sharded) client queries are not retried if the client is ended", async () => {
  const oldReplica = await testCluster.islandClient(0, STALE_REPLICA);

  testCluster.options.islands = () => [
    { no: 0, nodes: [TEST_CONFIG, { ...TEST_CONFIG, nameSuffix: "modified" }] },
  ];
  await testCluster.rediscover();

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
