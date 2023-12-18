import { MASTER, STALE_REPLICA } from "../../abstract/Shard";
import { maybeCall } from "../../helpers/misc";
import { TEST_CONFIG, testCluster, waitTillIslandCount } from "./test-utils";

const OLD_ISLANDS = maybeCall(testCluster.options.islands);
const TEST_ID = "100001234";

beforeEach(async () => {
  testCluster.options.shardsDiscoverIntervalMs = 20000; // very large intentionally
  testCluster.options.shardsDiscoverRecheckIslandsIntervalMs = 100; // recheck config that often
  testCluster.options.islands = OLD_ISLANDS;
  await waitTillIslandCount(1);
  expect(await testCluster.islands()).toHaveLength(1);
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

test("old client is ended without killing the running queries", async () => {
  const oldShard0Replica = await testCluster
    .shard(TEST_ID)
    .client(STALE_REPLICA);
  const promise = oldShard0Replica.query({
    query: ["SELECT pg_sleep(2)"],
    isWrite: false,
    annotations: [],
    op: "pg_sleep",
    table: "pg_sleep",
  });
  await reconfigureToTwoIslands();
  expect(oldShard0Replica.isEnded()).toBeTruthy();
  expect(await promise).toEqual([{ pg_sleep: "" }]);
});

async function reconfigureToTwoIslands(): Promise<void> {
  // Since we add the same physical host to island 1 as we already have in
  // island 0, we force the old Client to discover 0 shards to avoid "Shard
  // exists in more than one island" error.
  const oldMaster0 = await testCluster.islandClient(0, MASTER); // will be reused
  jest.spyOn(oldMaster0, "shardNos").mockResolvedValue([]);

  testCluster.options.islands = () => [
    { no: 0, nodes: [OLD_ISLANDS[0].nodes[0]] },
    { no: 1, nodes: [{ ...TEST_CONFIG, some: 1 }] },
  ];
  await waitTillIslandCount(2);
}
