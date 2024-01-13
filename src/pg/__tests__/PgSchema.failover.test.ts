import { inspect } from "util";
import { MASTER, STALE_REPLICA, type Shard } from "../../abstract/Shard";
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
  testCluster.options.locateIslandErrorRetryCount = 1;
  testCluster.options.locateIslandErrorRetryDelayMs = 100;

  islandClient1 = await testCluster.islandClient(0, MASTER);
  islandClient2 = await testCluster.islandClient(0, STALE_REPLICA);
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

  const shardOnRunErrorSpy = jest.spyOn(shard.options, "onRunError");
  const shardClient1 = await shard.client(MASTER);
  jest.spyOn(shardClient1, "query").mockImplementationOnce(async (...args) => {
    // On the 1st call here, the mock will be removed (restored) due to
    // mockImplementationOnce().
    try {
      await shardClient1.query(...args); // should throw
      throw "The query() call above should fail with a read-only SQL transaction error";
    } catch (e: unknown) {
      expect(inspect(e)).toMatch(/read_only_sql_transaction/);
      throw e;
    } finally {
      // After the query(), pretend that islandClient1 became replica and
      // islandClient2 became master, so after rediscovery and a retry to
      // query(), it will choose the right master (islandClient2).
      jest.spyOn(islandClient1, "isMaster").mockReturnValue(false);
      jest.spyOn(islandClient2, "isMaster").mockReturnValue(true);
    }
  });

  await shardRun(shard, schema.insert({ name: "test" }));
  expect(shardOnRunErrorSpy).toBeCalledTimes(1);
});

test("query fails when no master appears after a retry", async () => {
  islandClient1.options.hints = { transaction: "read only" };
  islandClient2.options.hints = { transaction: "read only" };

  const shardOnRunErrorSpy = jest.spyOn(shard.options, "onRunError");
  await expect(
    shardRun(shard, schema.insert({ name: "test" })),
  ).rejects.toThrow(/read_only_sql_transaction/);
  expect(shardOnRunErrorSpy).toBeCalledTimes(2);
});
