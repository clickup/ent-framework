import type { Shard } from "../../abstract/Shard";
import { MASTER } from "../../abstract/Shard";
import { nullthrows } from "../../internal/misc";
import { ID } from "../../types";
import { PgQueryDeleteWhere } from "../PgQueryDeleteWhere";
import { PgSchema } from "../PgSchema";
import type { TestPgClient } from "./test-utils";
import { recreateTestTables, shardRun, testCluster } from "./test-utils";

const schema = new PgSchema(
  'pg-schema.alias-pk"table',
  {
    user_id: { type: ID, autoInsert: "id_gen()" },
    name: { type: String },
  },
  ["user_id"],
);

let shard: Shard<TestPgClient>;
let master: TestPgClient;

beforeEach(async () => {
  await recreateTestTables([
    {
      CREATE: [
        `CREATE TABLE %T(
          user_id bigint NOT NULL PRIMARY KEY,
          name text NOT NULL
        )`,
      ],
      SCHEMA: schema,
      SHARD_AFFINITY: [],
    },
  ]);

  shard = await testCluster.randomShard();
  master = await shard.client(MASTER);
});

test("single ops", async () => {
  const id1 = await shardRun(
    shard,
    schema.insert({ user_id: "1", name: "n1" }),
  );
  master.toMatchSnapshot();
  expect(id1).toEqual("1");

  const id2 = await shardRun(
    shard,
    schema.upsert({ user_id: "2", name: "n2" }),
  );
  master.toMatchSnapshot();

  const id3 = await shardRun(shard, schema.insert({ name: "n3" }));
  master.toMatchSnapshot();

  {
    const res = await shardRun(shard, schema.update(nullthrows(id1), {})); // no DB query is sent here
    master.toMatchSnapshot();
    expect(res).toEqual(true);
  }

  {
    const res = await shardRun(
      shard,
      schema.upsert({ user_id: "101", name: "n11" }),
    );
    master.toMatchSnapshot();
    expect(res).toEqual("101");
  }

  {
    const res = await shardRun(shard, schema.delete(nullthrows(id1)));
    master.toMatchSnapshot();
    expect(res).toEqual(true);
  }

  {
    const res = await shardRun(
      shard,
      new PgQueryDeleteWhere(schema, { id: [id2!], $literal: ["1=1"] }),
    );
    master.toMatchSnapshot();
    expect(res).toEqual([id2]);
  }

  {
    const res = await shardRun(shard, schema.load(id3!));
    master.toMatchSnapshot();
    expect(res).toMatchObject({ id: id3, name: "n3" });
  }

  {
    const res = await shardRun(shard, schema.loadBy({ user_id: id3! }));
    master.toMatchSnapshot();
    expect(res).toMatchObject({ id: id3, name: "n3" });
  }

  {
    const res = await shardRun(shard, schema.count({ user_id: id3! }));
    master.toMatchSnapshot();
    expect(res).toEqual(1);
  }

  {
    const res = await shardRun(shard, schema.exists({ user_id: id3! }));
    master.toMatchSnapshot();
    expect(res).toStrictEqual(true);
  }

  {
    const res = await shardRun(
      shard,
      schema.select({ where: { user_id: id3! }, limit: 10 }),
    );
    master.toMatchSnapshot();
    expect(res).toMatchObject([{ user_id: id3 }]);
  }
});
