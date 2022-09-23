import type { Query } from "../../abstract/Query";
import type { Shard } from "../../abstract/Shard";
import { MASTER } from "../../abstract/Shard";
import { Timeline } from "../../abstract/Timeline";
import { join, nullthrows } from "../../helpers";
import { ID } from "../../types";
import { SQLQueryDeleteWhere } from "../SQLQueryDeleteWhere";
import { SQLSchema } from "../SQLSchema";
import type { TestSQLClient } from "./helpers/TestSQLClient";
import { testCluster } from "./helpers/TestSQLClient";

const TABLE = 'schema"test_composite';
const timeline = new Timeline();
let shard: Shard<TestSQLClient>;
let master: TestSQLClient;

beforeEach(async () => {
  timeline.reset();
  shard = await testCluster.randomShard();
  master = await shard.client(MASTER);
  await master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE);
  await master.rows(
    `CREATE TABLE %T(
      tenant_id bigint NOT NULL,
      user_id bigint NOT NULL,
      name text NOT NULL,
      PRIMARY KEY (tenant_id, user_id)
    )`,
    TABLE
  );
});

const schema = new SQLSchema(
  TABLE,
  {
    tenant_id: { type: ID },
    user_id: { type: ID },
    name: { type: String },
  },
  ["tenant_id", "user_id"]
);

async function shardRun<TOutput>(query: Query<TOutput>) {
  return shard.run(
    query,
    {
      trace: "some-trace",
      debugStack: "",
      vc: "some-vc",
      whyClient: undefined,
    },
    timeline,
    null
  );
}

test("single ops", async () => {
  const id1 = await shardRun(
    schema.insert({ tenant_id: "1", user_id: "1", name: "n1" })
  );
  master.toMatchSnapshot();
  expect(id1).toEqual("(1,1)");

  const id2 = await shardRun(
    schema.upsert({ tenant_id: "1", user_id: "2", name: "n2" })
  );
  await shardRun(schema.insert({ tenant_id: "1", user_id: "3", name: "n3" }));
  master.resetSnapshot();

  {
    const res = await shardRun(schema.update(nullthrows(id1), {})); // no DB query is sent here
    master.toMatchSnapshot();
    expect(res).toEqual(true);
  }

  {
    const res = await shardRun(
      schema.upsert({ tenant_id: "1", user_id: "101", name: "n11" })
    );
    master.toMatchSnapshot();
    expect(res).toEqual("(1,101)");
  }

  {
    const res = await shardRun(schema.update("(42,42)", { name: "absent" }));
    master.toMatchSnapshot();
    expect(res).toBeFalsy();
  }

  {
    const res = await shardRun(
      schema.update(nullthrows(id1), { name: "new-name" })
    );
    master.toMatchSnapshot();
    expect(res).toEqual(true);
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
    const res = await shardRun(schema.count({ user_id: "3" }));
    master.toMatchSnapshot();
    expect(res).toEqual(1);
  }

  {
    const res = await shardRun(
      schema.select({ where: { user_id: "3" }, limit: 10 })
    );
    master.toMatchSnapshot();
    expect(res).toMatchObject([{ tenant_id: "1", user_id: "3" }]);
  }
});

test("batched ops", async () => {
  const [id1, id2, id3, id4] = await join([
    shardRun(schema.insert({ tenant_id: "1", user_id: "1", name: "n1" })),
    shardRun(schema.insert({ tenant_id: "1", user_id: "2", name: "n2" })),
    shardRun(schema.insert({ tenant_id: "1", user_id: "3", name: "n3" })),
    shardRun(schema.insert({ tenant_id: "1", user_id: "4", name: "n4" })),
  ]);
  master.toMatchSnapshot();
  expect([id1, id2]).toEqual(["(1,1)", "(1,2)"]);

  {
    const res = await join([
      shardRun(schema.update(nullthrows(id1), {})), // no SQL query sent
      shardRun(schema.update(nullthrows(id2), {})),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual([true, true]);
  }

  {
    const res = await join([
      shardRun(schema.update(id1!, { name: "new-name-1" })),
      shardRun(schema.update(id2!, { name: "new-name-2" })),
      shardRun(schema.update("(42,42)", { name: "absent" })),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual([true, true, false]);
  }

  {
    const res = await join([
      shardRun(schema.upsert({ tenant_id: "1", user_id: "1", name: "n11" })),
      shardRun(schema.upsert({ tenant_id: "9", user_id: "9", name: "n9" })),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual(["(1,1)", "(9,9)"]);
  }

  {
    const res = await join([
      shardRun(schema.delete(id1!)),
      shardRun(schema.delete(id2!)),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual([true, true]);
  }

  {
    const res = await join([
      shardRun(schema.load(id3!)),
      shardRun(schema.load("(1,424)")),
    ]);
    master.toMatchSnapshot();
    expect(res).toMatchObject([{ id: id3, name: "n3" }, null]);
  }

  {
    const res = await join([
      shardRun(schema.loadBy({ tenant_id: "1", user_id: "3" })),
      shardRun(schema.loadBy({ tenant_id: "1", user_id: "4" })),
    ]);
    master.toMatchSnapshot();
    expect(res).toMatchObject([
      { id: id3, name: "n3" },
      { id: id4, name: "n4" },
    ]);
  }

  {
    const res = await join([
      shardRun(schema.count({ user_id: "3" })),
      shardRun(schema.count({ tenant_id: "1" })),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual([1, 2]);
  }

  {
    const res = await join([
      shardRun(
        schema.select({
          where: { user_id: "3" },
          order: [{ user_id: "ASC" }],
          limit: 10,
        })
      ),
      shardRun(
        schema.select({
          where: { tenant_id: "1" },
          order: [{ user_id: "ASC" }],
          limit: 10,
        })
      ),
    ]);
    master.toMatchSnapshot();
    expect(res).toMatchObject([
      [{ id: id3, tenant_id: "1", user_id: "3" }],
      [
        { id: id3, tenant_id: "1", user_id: "3" },
        { id: id4, tenant_id: "1", user_id: "4" },
      ],
    ]);
  }

  {
    const res = await join([
      shardRun(
        schema.select({
          where: { id: id3! },
          order: [{ user_id: "ASC" }],
          limit: 10,
        })
      ),
      shardRun(
        schema.select({
          where: { id: [id3!, id4!] },
          order: [{ user_id: "ASC" }],
          limit: 10,
        })
      ),
    ]);
    master.toMatchSnapshot();
    expect(res).toMatchObject([
      [{ id: id3, tenant_id: "1", user_id: "3" }],
      [
        { id: id3, tenant_id: "1", user_id: "3" },
        { id: id4, tenant_id: "1", user_id: "4" },
      ],
    ]);
  }
});
