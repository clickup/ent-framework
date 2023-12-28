import waitForExpect from "wait-for-expect";
import { MASTER, STALE_REPLICA } from "../../abstract/Shard";
import { ShardError } from "../../abstract/ShardError";
import { maybeCall } from "../../helpers/misc";
import { SQLSchema } from "../SQLSchema";
import {
  TEST_CONFIG,
  reconfigureToTwoIslands,
  recreateTestTables,
  shardRun,
  testCluster,
  waitTillIslandCount,
} from "./test-utils";

jest.useFakeTimers({ advanceTimers: true });

const OLD_ISLANDS = maybeCall(testCluster.options.islands);
const TEST_ID = "100001234";

const schema = new SQLSchema(
  'sql-schema.islands-reconfig"table',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  []
);

beforeEach(async () => {
  testCluster.options.shardsDiscoverIntervalMs = 20000; // very large intentionally
  testCluster.options.shardsDiscoverRecheckIslandsIntervalMs = 10;
  testCluster.options.islands = OLD_ISLANDS;
  await waitTillIslandCount(1);
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

test("when old client is returned to the code, but then ended, the operation is retried", async () => {
  const shard = await testCluster.randomShard();
  const master = await testCluster.islandClient(0, MASTER); // will be reused
  const oldReplica = await testCluster.islandClient(0, STALE_REPLICA);

  const masterShardNosSpy = jest.spyOn(master.client, "shardNos");
  testCluster.options.islands = () => [
    { no: 0, nodes: [TEST_CONFIG, { ...TEST_CONFIG, some: 1 }] },
  ];
  await waitForExpect(() => expect(masterShardNosSpy).toBeCalled());

  // By this time, it's mid-discovery, so the old clients are still being
  // returned to the caller. Sharded calls should be retried, so a new Client
  // should be chosen internally.
  await shardRun(shard, schema.select({ where: {}, limit: 1 }));

  // This one should fail, since we got the old Client before starting the
  // cluster reconfiguration.
  await waitForExpect(() => expect(oldReplica.isEnded()).toBeTruthy());
  await expect(
    oldReplica.query({
      query: ["SELECT 1"],
      isWrite: false,
      annotations: [],
      op: "test",
      table: "test",
    })
  ).rejects.toThrow(ShardError);
});
