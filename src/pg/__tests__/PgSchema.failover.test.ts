import delay from "delay";
import range from "lodash/range";
import { type Shard } from "../../abstract/Shard";
import { mapJoin } from "../../internal/misc";
import { PgSchema } from "../PgSchema";
import type { TestPgClient } from "./test-utils";
import { recreateTestTables, shardRun, testCluster } from "./test-utils";

const schema = new PgSchema(
  'pg-schema.failover"table',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  [],
);

let shard: Shard<TestPgClient>;
let islandClient1: TestPgClient;
let islandClient2: TestPgClient;

beforeEach(async () => {
  testCluster.options.shardsDiscoverIntervalMs = 1_000_000;
  testCluster.options.runOnShardErrorRetryCount = 1;
  testCluster.options.runOnShardErrorRediscoverIslandDelayMs = 100;
  testCluster.options.runOnShardErrorRediscoverClusterDelayMs = 10000000;
  await testCluster.rediscover();

  const island0 = await testCluster.island(0);
  islandClient1 = island0.master();
  islandClient2 = island0.replica();
  islandClient1.options.hints = { transaction: "read write" };
  islandClient2.options.hints = { transaction: "read only" };

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
});

test("query retries on new master when switchover happens", async () => {
  islandClient1.options.hints = { transaction: "read only" };
  islandClient2.options.hints = { transaction: "read write" };

  const islandRediscoverSpy = jest
    .spyOn(await testCluster.island(0), "rediscover")
    .mockImplementation(async () => {
      // After the query() fails, pretend that islandClient1 became replica and
      // islandClient2 became master, so after rediscovery and a retry to
      // query(), it will choose the right master (islandClient2).
      jest.spyOn(islandClient1, "role").mockReturnValue("replica");
      jest.spyOn(islandClient2, "role").mockReturnValue("master");
      return [];
    });

  // Produce a burst of erroring queries.
  const queries = range(50).map((i) => schema.insert({ name: `test${i}` }));
  await mapJoin(queries, async (query, i) => {
    await delay((i / queries.length) * 10);
    await shardRun(shard, query);
  });

  // All 10 queries fail and cause Island rediscovery to happen.
  expect(testCluster.options.loggers.runOnShardErrorLogger).toBeCalledTimes(
    queries.length,
  );

  // Island#rediscover() requests should be coalesced into significantly less
  // calls (i.e. Cluster#rediscoverIsland() is coalesce-memoized). Despite we
  // have 50 parallel queries, the calls to Island rediscovery were coalesced to
  // just a few.
  expect(islandRediscoverSpy.mock.calls.length).toBeLessThan(
    queries.length / 3,
  );
});

test("query fails when no master appears after a retry", async () => {
  islandClient1.options.hints = { transaction: "read only" };
  islandClient2.options.hints = { transaction: "read only" };

  await expect(
    shardRun(shard, schema.insert({ name: "test" })),
  ).rejects.toThrow(/read_only_sql_transaction/);
  expect(testCluster.options.loggers.runOnShardErrorLogger).toBeCalledTimes(2);
});
