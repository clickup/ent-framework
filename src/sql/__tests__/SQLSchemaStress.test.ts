import delay from "delay";
import hash from "object-hash";
import { QueryAnnotation } from "../../abstract/QueryAnnotation";
import { MASTER, Shard } from "../../abstract/Shard";
import { Timeline } from "../../abstract/Timeline";
import { join, mapJoin, nullthrows } from "../../helpers";
import { SQLSchema } from "../SQLSchema";
import { testCluster, TestSQLClient } from "./helpers/TestSQLClient";

const TABLE = 'schema"stress_test';
const timeline = new Timeline();
const annotation: QueryAnnotation = {
  trace: "some-trace",
  debugStack: "",
  vc: "some-vc",
};
let shard: Shard<TestSQLClient>;
let master: TestSQLClient;

beforeEach(async () => {
  shard = testCluster.randomShard();
  master = await shard.client(MASTER);

  await master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE);
  await master.rows(
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      prefix text NOT NULL,
      name text NOT NULL,
      UNIQUE (prefix, name)
    )`,
    TABLE
  );
  timeline.reset();
});

const schema = new SQLSchema(
  TABLE,
  {
    id: { type: String, autoInsert: "id_gen()" },
    prefix: { type: String },
    name: { type: String },
  },
  ["prefix", "name"]
);

test("stress", async () => {
  await runStress(50, 18, async (uniq) => {
    const names = range(2).map((i) => i + "-" + uniq);

    const ids = await mapJoin(names, async (name) =>
      shard.run(
        schema.insert({ prefix: "pfx", name }),
        annotation,
        timeline,
        null
      )
    );

    await join(
      ids.map(async (id, i) => {
        const row = nullthrows(
          await shard.run(
            schema.load(nullthrows(id)),
            annotation,
            timeline,
            null
          )
        );
        expect(row.name).toEqual(names[i]);
      })
    );

    await join(
      ids.map(async (id, i) => {
        const row = nullthrows(
          await shard.run(
            schema.loadBy({ prefix: "pfx", name: names[i] }),
            annotation,
            timeline,
            null
          )
        );
        expect(row.id).toEqual(id);
      })
    );

    await join(
      ids.map(async (id, i) => {
        const updated = await shard.run(
          schema.update(nullthrows(id), { name: "upd" + names[i] }),
          annotation,
          timeline,
          null
        );
        expect(updated).toBeTruthy();
        const row = nullthrows(
          await shard.run(
            schema.load(nullthrows(id)),
            annotation,
            timeline,
            null
          )
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
) {
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

function range(count: number) {
  return Array.from(Array(count).keys());
}
