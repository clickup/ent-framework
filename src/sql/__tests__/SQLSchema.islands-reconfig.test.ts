import delay from "delay";
import { MASTER, STALE_REPLICA } from "../../abstract/Shard";
import { maybeCall } from "../../helpers/misc";
import { TEST_CONFIG, testCluster } from "./test-utils";

beforeEach(async () => {
  testCluster.options.locateIslandErrorRetryCount = 2;
  testCluster.options.locateIslandErrorRetryDelayMs = 1000;
  testCluster.options.shardsDiscoverIntervalMs = 1000;
  testCluster.options.shardsDiscoverErrorRetryDelayMs = 100;
  expect(await testCluster.islands()).toHaveLength(1);
});

test("node added dynamically appears in the cluster, old client is removed", async () => {
  const errorSpy = jest.spyOn(testCluster.loggers, "swallowedErrorLogger");

  const oldIsland0Shards = await testCluster.islandShards(0);
  const oldMaster0 = await testCluster.islandClient(0, MASTER); // will be reused
  const oldMaster0SpyEnd = jest.spyOn(oldMaster0, "end");
  const oldReplica0 = await testCluster.islandClient(0, STALE_REPLICA); // will disappear
  const oldReplica0SpyEnd = jest.spyOn(oldReplica0, "end");

  // Since we add the same physical host to island 1 as we already have in
  // island 0, we force the old Client to discover 0 shards to avoid "Shard
  // exists in more than one island" error.
  jest.spyOn(oldMaster0, "shardNos").mockResolvedValue([]);

  const oldIslands = maybeCall(testCluster.options.islands);
  testCluster.options.islands = () => [
    { no: 0, nodes: [oldIslands[0].nodes[0]] },
    { no: 1, nodes: [{ ...TEST_CONFIG, some: 1 }] },
  ];

  const startTime = performance.now();
  while (
    performance.now() - startTime < 10000 &&
    (await testCluster.islands()).length !== 2
  ) {
    await delay(100);
    expect(errorSpy).not.toHaveBeenCalled();
  }

  expect(await testCluster.islands()).toHaveLength(2);
  expect(oldReplica0SpyEnd).toHaveBeenCalled();
  expect(oldMaster0SpyEnd).not.toHaveBeenCalled();

  const newMaster0 = await testCluster.islandClient(0, MASTER);
  const newMaster1 = await testCluster.islandClient(1, MASTER);
  expect(newMaster0).toBe(oldMaster0);
  expect(newMaster1).not.toBe(newMaster0);

  expect(await testCluster.islandShards(0)).toEqual([]);
  expect(await testCluster.islandShards(1)).toEqual(oldIsland0Shards);
});
