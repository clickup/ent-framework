import waitForExpect from "wait-for-expect";
import type { Query } from "../../abstract/Query";
import type { Shard, STALE_REPLICA } from "../../abstract/Shard";
import { MASTER } from "../../abstract/Shard";
import { ShardError } from "../../abstract/ShardError";
import { Timeline } from "../../abstract/Timeline";
import { SQLSchema } from "../SQLSchema";
import type { TestSQLClient } from "./helpers/TestSQLClient";
import { testCluster } from "./helpers/TestSQLClient";

const TABLE = 'schema"discover_test';
const TABLE_BAK = `${TABLE}_bak`;
const ID_FROM_UNKNOWN_SHARD = "510001234567";

const timeline = new Timeline();

let shard: Shard<TestSQLClient>;
let master: TestSQLClient;

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

beforeEach(async () => {
  testCluster.options.locateIslandErrorRetryCount = 2;
  testCluster.options.locateIslandErrorRetryDelayMs = 1000;

  shard = await testCluster.randomShard();
  master = await shard.client(MASTER);

  await master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE);
  await master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_BAK);
  await master.rows(
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      name text NOT NULL
    )`,
    TABLE
  );
  timeline.reset();
});

const schema = new SQLSchema(
  TABLE,
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  []
);

test("shard relocation error when accessing a table should be retried", async () => {
  testCluster.options.locateIslandErrorRetryCount = 30;

  await master.rows("ALTER TABLE %T RENAME TO %T", TABLE, TABLE_BAK);

  const query = schema.insert({ name: "test" });
  const spyQueryRun = jest.spyOn(query, "run");
  const resPromise = shardRun(shard, query);

  // Pause until we have at least 2 retries happened.
  await waitForExpect(() => expect(spyQueryRun).toBeCalledTimes(2));
  await expect(spyQueryRun.mock.results[0].value).rejects.toThrow(ShardError);

  // Now after we have some retries, continue & rename the table back.
  await master.rows("ALTER TABLE %T RENAME TO %T", TABLE_BAK, TABLE);
  expect(await resPromise).toMatch(/^\d+$/);

  master.toMatchSnapshot();
});

test("shard-to-island resolution failure should cause rediscovery when running a query", async () => {
  testCluster.options.locateIslandErrorRetryDelayMs = 1;

  const shard = testCluster.shard(ID_FROM_UNKNOWN_SHARD);
  const spyShardOnRunError = jest.spyOn(shard.options, "onRunError");

  await expect(
    shardRun(shard, schema.load(ID_FROM_UNKNOWN_SHARD))
  ).rejects.toThrow(ShardError);
  expect(spyShardOnRunError).toBeCalledTimes(3);
});

test("shard-to-island resolution failure should cause rediscover when just getting a client", async () => {
  testCluster.options.locateIslandErrorRetryDelayMs = 1;

  const shard = testCluster.shard(ID_FROM_UNKNOWN_SHARD);
  const spyShardOnRunError = jest.spyOn(shard.options, "onRunError");

  await expect(shard.client(MASTER)).rejects.toThrow(ShardError);
  expect(spyShardOnRunError).toBeCalledTimes(3);
});
