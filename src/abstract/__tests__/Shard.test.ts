import { testCluster } from "../../pg/__tests__/test-utils";

test("Shard.lastKnownIslandNo", async () => {
  const shard = testCluster.shardByNo(1);
  expect(shard.lastKnownIslandNo).toBeNull();
  await testCluster.rediscover();
  expect(shard.lastKnownIslandNo).toEqual(0);
});
