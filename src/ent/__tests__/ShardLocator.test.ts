import groupBy from "lodash/groupBy";
import range from "lodash/range";
import { mapJoin } from "../../internal/misc";
import { testCluster } from "../../pg/__tests__/test-utils";
import { GLOBAL_SHARD } from "../ShardAffinity";
import { ShardLocator } from "../ShardLocator";

test("singleShardForInsert with colocation affinity", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    entName: "post",
    shardAffinity: ["user_id"],
    uniqueKey: ["user_id", "title"],
    inverses: [],
  });
  const s1 = await shardLocator.singleShardForInsert(
    { user_id: "100020000000" },
    "insert",
  );
  expect(s1).toEqual(testCluster.shard("100020000000"));
});

test("singleShardForInsert with GLOBAL_SHARD affinity", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    entName: "test",
    shardAffinity: GLOBAL_SHARD,
    uniqueKey: ["user_id", "title"],
    inverses: [],
  });
  const s1 = await shardLocator.singleShardForInsert(
    { user_id: "100020000000" },
    "insert",
  );
  expect(s1).toEqual(testCluster.globalShard());
});

test("singleShardForInsert with by-unique-key random shard", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    entName: "test",
    shardAffinity: ["company_id"],
    uniqueKey: ["user_id", "title"],
    inverses: [],
  });
  const s1 = await shardLocator.singleShardForInsert(
    { company_id: null, user_id: "100020000000", title: new Date(12345) },
    "insert",
  );
  for (let i = 0; i < 10; i++) {
    const s2 = await shardLocator.singleShardForInsert(
      { company_id: null, user_id: "100020000000", title: new Date(12345) },
      "insert",
    );
    expect(s2).toEqual(s1);
  }
});

test("singleShardForInsert with truly random shard", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    entName: "test",
    shardAffinity: ["user_id"],
    uniqueKey: undefined,
    inverses: [],
  });
  const shardNos = groupBy(
    await mapJoin(
      range(0, 1000),
      async () =>
        (await shardLocator.singleShardForInsert({ user_id: null }, "insert"))
          .no,
    ),
  );
  expect(Object.keys(shardNos)).toHaveLength(
    (await testCluster.nonGlobalShards()).length,
  );
});

test("singleShardForInsert with complex filter by ID", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    entName: "test",
    shardAffinity: ["user_id"],
    uniqueKey: undefined,
    inverses: [],
  });
  const shard = await shardLocator.singleShardForInsert(
    { user_id: "100020000000", id: { $gt: "100010000000" } },
    "insert",
  );
  expect(shard.no).toEqual(testCluster.shard("100020000000").no);
});

test("singleShardForInsert with simple filter by ID", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    entName: "test",
    shardAffinity: ["user_id"],
    uniqueKey: undefined,
    inverses: [],
  });
  const shard = await shardLocator.singleShardForInsert(
    { user_id: "100020000000", id: "100010000000" },
    "insert",
  );
  expect(shard.no).toEqual(testCluster.shard("100010000000").no);
});

test("singleShardForInsert with simple filter by ID arr", async () => {
  const shardLocator = new ShardLocator({
    cluster: testCluster,
    entName: "test",
    shardAffinity: ["user_id"],
    uniqueKey: undefined,
    inverses: [],
  });
  const shard = await shardLocator.singleShardForInsert(
    { user_id: "100020000000", id: ["100010000000", "100030000001"] },
    "insert",
  );
  expect(shard.no).toEqual(testCluster.shard("100010000000").no);
});
