import range from "lodash/range";
import waitForExpect from "wait-for-expect";
import type { Shard } from "../../abstract/Shard";
import { MASTER } from "../../abstract/Shard";
import { CachedRefreshedValue } from "../../internal/CachedRefreshedValue";
import { mapJoin, maybeCall } from "../../internal/misc";
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

  testCluster.options.runOnShardErrorRediscoverClusterDelayMs = 1000;
  testCluster.options.shardsDiscoverIntervalMs = 1_000_000;
  await testCluster.rediscover();

  shard = await testCluster.randomShard();
  master = await shard.client(MASTER);
});

test("shard relocation error when accessing a table should be retried", async () => {
  testCluster.options.runOnShardErrorRetryCount = 30;

  await master.rows("ALTER TABLE %T RENAME TO %T", schema.name, TABLE_BAK);

  const waitRefreshSpy = jest.spyOn(
    CachedRefreshedValue.prototype,
    "refreshAndWait",
  );

  const queries = range(50).map((i) => schema.insert({ name: `test${i}` }));
  const queryRunSpies = queries.map((query) => jest.spyOn(query, "run"));
  const resPromise = mapJoin(queries, async (query) => shardRun(shard, query)); // runs one batched query

  // Pause until we have at least 2 retries happened.
  await waitForExpect(
    () => expect(queryRunSpies[0]).toBeCalledTimes(2),
    maybeCall(testCluster.options.runOnShardErrorRediscoverClusterDelayMs) * 4, // timeout
    maybeCall(testCluster.options.runOnShardErrorRediscoverClusterDelayMs), // retry interval
  );
  await expect(queryRunSpies[0].mock.results[0].value).rejects.toThrow(
    /undefined_object/,
  );

  // Check that calls to refreshAndWait() were coalesced (i.e.
  // Cluster#rediscoverCluster() is coalesce-memoized). Despite we have 50
  // parallel queries, the calls to whole-Cluster rediscovery were coalesced to
  // just a few.
  expect(waitRefreshSpy.mock.calls.length).toBeLessThan(queries.length / 3);

  // Now, after we had some retries, continue & rename the table back.
  await master.rows("ALTER TABLE %T RENAME TO %T", TABLE_BAK, schema.name);

  // The queries succeed (no downtime).
  expect((await resPromise)[0]).toMatch(/^\d+$/);
});

test("shard-to-island resolution failure should NOT cause rediscovery when running a query", async () => {
  const shard = testCluster.shard(ID_FROM_UNKNOWN_SHARD);
  await expect(
    shardRun(shard, schema.load(ID_FROM_UNKNOWN_SHARD)),
  ).rejects.toThrow(/not discoverable/);
  expect(testCluster.options.loggers.runOnShardErrorLogger).toBeCalledTimes(1);
});

test("shard-to-island resolution failure should NOT cause rediscover when just getting a client", async () => {
  const shard = testCluster.shard(ID_FROM_UNKNOWN_SHARD);
  await expect(shard.client(MASTER)).rejects.toThrow(/not discoverable/);
  expect(testCluster.options.loggers.runOnShardErrorLogger).toBeCalledTimes(1);
});
