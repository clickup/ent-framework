import type { Shard } from "../../abstract/Shard";
import { MASTER } from "../../abstract/Shard";
import { join, nullthrows } from "../../internal/misc";
import { ID } from "../../types";
import { PgQueryDeleteWhere } from "../PgQueryDeleteWhere";
import { PgSchema } from "../PgSchema";
import type { TestPgClient } from "./test-utils";
import { recreateTestTables, shardRun, testCluster } from "./test-utils";

const schema = new PgSchema(
  'pg-schema.composite-pk"table',
  {
    tenant_id: { type: ID },
    user_id: { type: ID },
    name: { type: String },
  },
  ["tenant_id", "user_id"],
);

let shard: Shard<TestPgClient>;
let master: TestPgClient;

beforeEach(async () => {
  await recreateTestTables([
    {
      CREATE: [
        `CREATE TABLE %T(
          tenant_id bigint NOT NULL,
          user_id bigint NOT NULL,
          name text NOT NULL,
          PRIMARY KEY (tenant_id, user_id)
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
    schema.insert({ tenant_id: "1", user_id: "1", name: "n1" }),
  );
  master.toMatchSnapshot();
  expect(id1).toEqual("(1,1)");

  const id2 = await shardRun(
    shard,
    schema.upsert({ tenant_id: "1", user_id: "2", name: "n2" }),
  );
  await shardRun(
    shard,
    schema.insert({ tenant_id: "1", user_id: "3", name: "n3" }),
  );
  master.resetSnapshot();

  {
    const res = await shardRun(shard, schema.update(nullthrows(id1), {})); // no DB query is sent here
    master.toMatchSnapshot();
    expect(res).toEqual(true);
  }

  {
    const res = await shardRun(
      shard,
      schema.upsert({ tenant_id: "1", user_id: "101", name: "n11" }),
    );
    master.toMatchSnapshot();
    expect(res).toEqual("(1,101)");
  }

  {
    const res = await shardRun(
      shard,
      schema.update("(42,42)", { name: "absent" }),
    );
    master.toMatchSnapshot();
    expect(res).toBeFalsy();
  }

  {
    const res = await shardRun(
      shard,
      schema.update(nullthrows(id1), { name: "new-name" }),
    );
    master.toMatchSnapshot();
    expect(res).toEqual(true);
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
    const res = await shardRun(shard, schema.count({ user_id: "3" }));
    master.toMatchSnapshot();
    expect(res).toEqual(1);
  }

  {
    const res = await shardRun(shard, schema.exists({ user_id: "3" }));
    master.toMatchSnapshot();
    expect(res).toStrictEqual(true);
  }

  {
    const res = await shardRun(
      shard,
      schema.select({ where: { user_id: "3" }, limit: 10 }),
    );
    master.toMatchSnapshot();
    expect(res).toMatchObject([{ tenant_id: "1", user_id: "3" }]);
  }
});

test("batched ops", async () => {
  const [id1, id2, id3, id4] = await join([
    shardRun(
      shard,
      schema.insert({ tenant_id: "1", user_id: "1", name: "n1" }),
    ),
    shardRun(
      shard,
      schema.insert({ tenant_id: "1", user_id: "2", name: "n2" }),
    ),
    shardRun(
      shard,
      schema.insert({ tenant_id: "1", user_id: "3", name: "n3" }),
    ),
    shardRun(
      shard,
      schema.insert({ tenant_id: "1", user_id: "4", name: "n4" }),
    ),
  ]);
  master.toMatchSnapshot();
  expect([id1, id2]).toEqual(["(1,1)", "(1,2)"]);

  {
    const res = await join([
      shardRun(shard, schema.update(nullthrows(id1), {})), // no SQL query sent
      shardRun(shard, schema.update(nullthrows(id2), {})),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual([true, true]);
  }

  {
    const res = await join([
      shardRun(shard, schema.update(id1!, { name: "new-name-1" })),
      shardRun(shard, schema.update(id2!, { name: "new-name-2" })),
      shardRun(shard, schema.update("(42,42)", { name: "absent" })),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual([true, true, false]);
  }

  {
    const res = await join([
      shardRun(
        shard,
        schema.upsert({ tenant_id: "1", user_id: "1", name: "n11" }),
      ),
      shardRun(
        shard,
        schema.upsert({ tenant_id: "9", user_id: "9", name: "n9" }),
      ),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual(["(1,1)", "(9,9)"]);
  }

  {
    const res = await join([
      shardRun(shard, schema.delete(id1!)),
      shardRun(shard, schema.delete(id2!)),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual([true, true]);
  }

  {
    const res = await join([
      shardRun(shard, schema.load(id3!)),
      shardRun(shard, schema.load("(1,424)")),
    ]);
    master.toMatchSnapshot();
    expect(res).toMatchObject([{ id: id3, name: "n3" }, null]);
  }

  {
    const res = await join([
      shardRun(shard, schema.loadBy({ tenant_id: "1", user_id: "3" })),
      shardRun(shard, schema.loadBy({ tenant_id: "1", user_id: "4" })),
    ]);
    master.toMatchSnapshot();
    expect(res).toMatchObject([
      { id: id3, name: "n3" },
      { id: id4, name: "n4" },
    ]);
  }

  {
    const res = await join([
      shardRun(shard, schema.count({ user_id: "3" })),
      shardRun(shard, schema.count({ tenant_id: "1" })),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual([1, 2]);
  }

  {
    const res = await join([
      shardRun(shard, schema.exists({ user_id: "3" })),
      shardRun(shard, schema.exists({ tenant_id: "1" })),
      shardRun(shard, schema.exists({ tenant_id: "199999" })),
    ]);
    master.toMatchSnapshot();
    expect(res).toEqual([true, true, false]);
  }

  {
    const res = await join([
      shardRun(
        shard,
        schema.select({
          where: { user_id: "3" },
          order: [{ user_id: "ASC" }],
          limit: 10,
        }),
      ),
      shardRun(
        shard,
        schema.select({
          where: { tenant_id: "1" },
          order: [{ user_id: "ASC" }],
          limit: 10,
        }),
      ),
      shardRun(
        shard,
        schema.select({
          where: { tenant_id: "101" },
          order: [{ user_id: "ASC" }],
          limit: 10,
        }),
      ),
    ]);
    master.toMatchSnapshot();
    expect(res).toMatchObject([
      [{ id: id3, tenant_id: "1", user_id: "3" }],
      [
        { id: id3, tenant_id: "1", user_id: "3" },
        { id: id4, tenant_id: "1", user_id: "4" },
      ],
      [],
    ]);
  }

  {
    const res = await join([
      shardRun(
        shard,
        schema.select({
          where: { id: id3! },
          order: [{ user_id: "ASC" }],
          limit: 10,
        }),
      ),
      shardRun(
        shard,
        schema.select({
          where: { id: [id3!, id4!] },
          order: [{ user_id: "ASC" }],
          limit: 10,
        }),
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
