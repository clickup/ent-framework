import type { Query } from "../../abstract/Query";
import { MASTER, STALE_REPLICA, type Shard } from "../../abstract/Shard";
import { ShardError } from "../../abstract/ShardError";
import { Timeline } from "../../abstract/Timeline";
import type { SQLClient } from "../SQLClient";
import { SQLSchema } from "../SQLSchema";
import type { TestSQLClient } from "./test-utils";
import { recreateTestTables, testCluster } from "./test-utils";

const schema = new SQLSchema(
  'sql-schema.failover"table',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  []
);

const timeline = new Timeline();
let shard: Shard<TestSQLClient>;
let islandClient1: SQLClient;
let islandClient2: SQLClient;

beforeEach(async () => {
  testCluster.options.locateIslandErrorRetryCount = 1;
  testCluster.options.locateIslandErrorRetryDelayMs = 100;

  islandClient1 = (await testCluster.islandClient(0, MASTER)).client;
  islandClient2 = (await testCluster.islandClient(0, STALE_REPLICA)).client;
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

  timeline.reset();
  shard = await testCluster.randomShard();
});

async function shardRun<TOutput>(
  shard: Shard<TestSQLClient>,
  query: Query<TOutput>,
  freshness: typeof STALE_REPLICA | null = null
): Promise<TOutput> {
  return shard.run(
    query,
    {
      trace: "some-trace",
      debugStack: "",
      vc: "some-vc",
      whyClient: undefined,
      attempt: 0,
    },
    timeline,
    freshness
  );
}

test("query retries on new master when switchover happens", async () => {
  islandClient1.options.hints = { transaction: "read only" };
  islandClient2.options.hints = { transaction: "read write" };

  const shardOnRunErrorSpy = jest.spyOn(shard.options, "onRunError");
  const shardClient1 = (await shard.client(MASTER)).client;
  jest.spyOn(shardClient1, "query").mockImplementationOnce(async (...args) => {
    // On the 1st call here, the mock will be removed (restored) due to
    // mockImplementationOnce().
    try {
      await shardClient1.query(...args); // should throw
      throw "The query() call above should fail with a read-only SQL transaction error";
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ShardError);
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
    shardRun(shard, schema.insert({ name: "test" }))
  ).rejects.toThrow(ShardError);
  expect(shardOnRunErrorSpy).toBeCalledTimes(2);
});
