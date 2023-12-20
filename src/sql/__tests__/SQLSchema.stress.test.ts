import delay from "delay";
import hash from "object-hash";
import type { Shard } from "../../abstract/Shard";
import { join, mapJoin, nullthrows } from "../../helpers/misc";
import { SQLSchema } from "../SQLSchema";
import type { TestSQLClient } from "./test-utils";
import { recreateTestTables, shardRun, testCluster } from "./test-utils";

const schema = new SQLSchema(
  'sql-schema.stress"table',
  {
    id: { type: String, autoInsert: "id_gen()" },
    prefix: { type: String },
    name: { type: String },
  },
  ["prefix", "name"]
);

let shard: Shard<TestSQLClient>;

beforeEach(async () => {
  await recreateTestTables([
    {
      CREATE: [
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          prefix text NOT NULL,
          name text NOT NULL,
          UNIQUE (prefix, name)
        )`,
      ],
      SCHEMA: schema,
      SHARD_AFFINITY: [],
    },
  ]);

  shard = await testCluster.randomShard();
});

test("stress", async () => {
  await runStress(50, 18, async (uniq) => {
    const names = range(2).map((i) => i + "-" + uniq);

    const ids = await mapJoin(names, async (name) =>
      shardRun(shard, schema.insert({ prefix: "pfx", name }))
    );

    await join(
      ids.map(async (id, i) => {
        const row = nullthrows(
          await shardRun(shard, schema.load(nullthrows(id)))
        );
        expect(row.name).toEqual(names[i]);
      })
    );

    await join(
      ids.map(async (id, i) => {
        const row = nullthrows(
          await shardRun(
            shard,
            schema.loadBy({ prefix: "pfx", name: names[i] })
          )
        );
        expect(row.id).toEqual(id);
      })
    );

    await join(
      ids.map(async (id, i) => {
        const updated = await shardRun(
          shard,
          schema.update(nullthrows(id), { name: "upd" + names[i] })
        );
        expect(updated).toBeTruthy();
        const row = nullthrows(
          await shardRun(shard, schema.load(nullthrows(id)))
        );
        expect(row.name).toEqual("upd" + names[i]);
      })
    );
  });
}, 300000);

async function runStress(
  parallelism: number,
  iterations: number,
  func: (uniq: string) => Promise<void>
): Promise<void> {
  let uniq = "";
  await join(
    range(parallelism).map(async () => {
      for (let i = 0; i < iterations; i++) {
        await delay(Math.round(Math.random() * 5));
        uniq = hash(uniq);
        await func(uniq);
      }
    })
  );
}

function range(count: number): number[] {
  return Array.from(Array(count).keys());
}
