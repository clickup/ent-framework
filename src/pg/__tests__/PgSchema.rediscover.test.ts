import waitForExpect from "wait-for-expect";
import type { Shard } from "../../abstract/Shard";
import { MASTER } from "../../abstract/Shard";
import { maybeCall } from "../../internal/misc";
import { escapeIdent } from "../helpers/escapeIdent";
import { PgSchema } from "../PgSchema";
import type { TestPgClient } from "./test-utils";
import { recreateTestTables, shardRun, testCluster } from "./test-utils";

const schema = new PgSchema(
  'pg-schema.rediscover"table',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  [],
);

const TABLE_BAK = `${schema.name}_bak`;
const ID_FROM_UNKNOWN_SHARD = "510001234567";

let shard: Shard<TestPgClient>;
let master: TestPgClient;

beforeEach(async () => {
  await recreateTestTables([
    {
      CREATE: [
        `DROP TABLE IF EXISTS ${escapeIdent(TABLE_BAK)} CASCADE`,
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          name text NOT NULL
        )`,
      ],
      SCHEMA: schema,
      SHARD_AFFINITY: [],
    },
  ]);

  testCluster.options.locateIslandErrorRetryCount = 2;
  testCluster.options.locateIslandErrorRetryDelayMs = 1000;
  testCluster.options.shardsDiscoverIntervalMs = 1000;

  shard = await testCluster.randomShard();
  master = await shard.client(MASTER);
});

test("shard relocation error when accessing a table should be retried", async () => {
  testCluster.options.locateIslandErrorRetryCount = 30;

  await master.rows("ALTER TABLE %T RENAME TO %T", schema.name, TABLE_BAK);

  const query = schema.insert({ name: "test" });
  const spyQueryRun = jest.spyOn(query, "run");
  const resPromise = shardRun(shard, query);

  // Pause until we have at least 2 retries happened.
  await waitForExpect(
    () => expect(spyQueryRun).toBeCalledTimes(2),
    maybeCall(testCluster.options.locateIslandErrorRetryDelayMs) * 4, // timeout
    maybeCall(testCluster.options.locateIslandErrorRetryDelayMs), // retry interval
  );
  await expect(spyQueryRun.mock.results[0].value).rejects.toThrow(
    /undefined_table/,
  );

  // Now after we have some retries, continue & rename the table back.
  await master.rows("ALTER TABLE %T RENAME TO %T", TABLE_BAK, schema.name);
  expect(await resPromise).toMatch(/^\d+$/);
});

test("shard-to-island resolution failure should NOT cause rediscovery when running a query", async () => {
  testCluster.options.locateIslandErrorRetryDelayMs = 1;

  const shard = testCluster.shard(ID_FROM_UNKNOWN_SHARD);
  const spyShardOnRunError = jest.spyOn(shard.options, "onRunError");

  await expect(
    shardRun(shard, schema.load(ID_FROM_UNKNOWN_SHARD)),
  ).rejects.toThrow(/not discoverable/);
  expect(spyShardOnRunError).toBeCalledTimes(1);
});

test("shard-to-island resolution failure should NOT cause rediscover when just getting a client", async () => {
  testCluster.options.locateIslandErrorRetryDelayMs = 1;

  const shard = testCluster.shard(ID_FROM_UNKNOWN_SHARD);
  const spyShardOnRunError = jest.spyOn(shard.options, "onRunError");

  await expect(shard.client(MASTER)).rejects.toThrow(/not discoverable/);
  expect(spyShardOnRunError).toBeCalledTimes(1);
});

test("shard-to-island resolution failure should run rediscovery immediately", async () => {
  testCluster.options.shardsDiscoverIntervalMs = 1_000_000;

  const shard = testCluster.shard(ID_FROM_UNKNOWN_SHARD);
  await expect(
    shardRun(shard, schema.load(ID_FROM_UNKNOWN_SHARD)),
  ).rejects.toThrow(/not discoverable/);
}, 10_000 /* timeout */);