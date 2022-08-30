import groupBy from "lodash/groupBy";
import range from "lodash/range";
import { testCluster } from "../../sql/__tests__/helpers/TestSQLClient";
import { GLOBAL_SHARD } from "../Configuration";
import { ShardLocator } from "../ShardLocator";

test("singleShardFromInput with colocation affinity", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    schemaName: "post",
    shardAffinity: ["user_id"],
    uniqueKey: ["user_id", "title"],
    inverses: [],
  });
  const s1 = shardLocator.singleShardFromInput(
    { user_id: "100020000000" },
    "INSERT",
    true
  );
  expect(s1).toEqual(testCluster.shard("100020000000"));
});

test("singleShardFromInput with GLOBAL_SHARD affinity", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    schemaName: "test",
    shardAffinity: GLOBAL_SHARD,
    uniqueKey: ["user_id", "title"],
    inverses: [],
  });
  const s1 = shardLocator.singleShardFromInput(
    { user_id: "100020000000" },
    "INSERT",
    true
  );
  expect(s1).toEqual(testCluster.globalShard());
});

test("singleShardFromInput with by-unique-key random shard", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    schemaName: "test",
    shardAffinity: ["company_id"],
    uniqueKey: ["user_id", "title"],
    inverses: [],
  });
  const s1 = shardLocator.singleShardFromInput(
    { company_id: null, user_id: "100020000000", title: new Date(12345) },
    "INSERT",
    true
  );
  for (let i = 0; i < 10; i++) {
    const s2 = shardLocator.singleShardFromInput(
      { company_id: null, user_id: "100020000000", title: new Date(12345) },
      "INSERT",
      true
    );
    expect(s2).toEqual(s1);
  }
});

test("singleShardFromInput with truly random shard", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    schemaName: "test",
    shardAffinity: ["user_id"],
    uniqueKey: undefined,
    inverses: [],
  });
  const shardNos = groupBy(
    range(0, 100).map(
      () =>
        shardLocator.singleShardFromInput({ user_id: null }, "INSERT", true).no
    )
  );
  expect(Object.keys(shardNos)).toHaveLength(testCluster.numWriteShards - 1);
});