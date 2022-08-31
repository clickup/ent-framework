import type { Query } from "../../abstract/Query";
import type { Shard } from "../../abstract/Shard";
import { MASTER } from "../../abstract/Shard";
import { Timeline } from "../../abstract/Timeline";
import { nullthrows } from "../../helpers";
import { ID } from "../../types";
import { SQLQueryDeleteWhere } from "../SQLQueryDeleteWhere";
import { SQLSchema } from "../SQLSchema";
import type { TestSQLClient } from "./helpers/TestSQLClient";
import { testCluster } from "./helpers/TestSQLClient";

const TABLE = 'schema"test_alias';
const timeline = new Timeline();
let shard: Shard<TestSQLClient>;
let master: TestSQLClient;

beforeEach(async () => {
  timeline.reset();
  shard = testCluster.randomShard();
  master = await shard.client(MASTER);
  await master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE);
  await master.rows(
    `CREATE TABLE %T(
      user_id bigint NOT NULL PRIMARY KEY,
      name text NOT NULL
    )`,
    TABLE
  );
});

const schema = new SQLSchema(
  TABLE,
  {
    user_id: { type: ID, autoInsert: "id_gen()" },
    name: { type: String },
  },
  ["user_id"]
);

async function shardRun<TOutput>(query: Query<TOutput>) {
  return shard.run(
    query,
    {
      trace: "some-trace",
      rawTrace: "123456434",
      debugStack: "",
      vc: "some-vc",
      whyClient: undefined,
    },
    timeline,
    null
  );
}

test("ops_single", async () => {
  const id1 = await shardRun(schema.insert({ user_id: "1", name: "n1" }));
  master.toMatchSnapshot();
  expect(id1).toEqual("1");

  const id2 = await shardRun(schema.upsert({ user_id: "2", name: "n2" }));
  master.toMatchSnapshot();

  const id3 = await shardRun(schema.insert({ name: "n3" }));
  master.toMatchSnapshot();

  {
    const res = await shardRun(schema.update(nullthrows(id1), {})); // no DB query is sent here
    master.toMatchSnapshot();
    expect(res).toEqual(true);
  }

  {
    const res = await shardRun(schema.upsert({ user_id: "101", name: "n11" }));
    master.toMatchSnapshot();
    expect(res).toEqual("101");
  }

  {
    const res = await shardRun(schema.delete(nullthrows(id1)));
    master.toMatchSnapshot();
    expect(res).toEqual(true);
  }

  {
    const res = await shardRun(
      new SQLQueryDeleteWhere(schema, { id: [id2!], $literal: ["1=1"] })
    );
    master.toMatchSnapshot();
    expect(res).toEqual([id2]);
  }

  {
    const res = await shardRun(schema.load(id3!));
    master.toMatchSnapshot();
    expect(res).toMatchObject({ id: id3, name: "n3" });
  }

  {
    const res = await shardRun(schema.loadBy({ user_id: id3! }));
    master.toMatchSnapshot();
    expect(res).toMatchObject({ id: id3, name: "n3" });
  }

  {
    const res = await shardRun(schema.count({ user_id: id3! }));
    master.toMatchSnapshot();
    expect(res).toEqual(1);
  }

  {
    const res = await shardRun(
      schema.select({ where: { user_id: id3! }, limit: 10 })
    );
    master.toMatchSnapshot();
    expect(res).toMatchObject([{ user_id: id3 }]);
  }
});
