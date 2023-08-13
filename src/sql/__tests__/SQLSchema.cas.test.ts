import assert from "assert";
import type { Query } from "../../abstract/Query";
import type { Shard, STALE_REPLICA } from "../../abstract/Shard";
import { MASTER } from "../../abstract/Shard";
import { Timeline } from "../../abstract/Timeline";
import { join, nullthrows } from "../../helpers/misc";
import { SQLSchema } from "../SQLSchema";
import type { TestSQLClient } from "./test-utils";
import {
  ByteaBuffer,
  EncryptedValue,
  recreateTestTables,
  testCluster,
} from "./test-utils";

const schema = new SQLSchema(
  'sql-schema.cas"table',
  {
    name: { type: String },
    ts: { type: Date, allowNull: true },
    encrypted_field: {
      type: EncryptedValue,
      allowNull: true,
      autoInsert: "NULL",
    },
    buffer_field: {
      type: ByteaBuffer,
      allowNull: true,
      autoInsert: "NULL",
    },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
    id: { type: String, autoInsert: "id_gen()" },
  },
  ["name"]
);

const timeline = new Timeline();
let shard: Shard<TestSQLClient>;
let master: TestSQLClient;
let replica: TestSQLClient;

beforeEach(async () => {
  await recreateTestTables([
    {
      CREATE: [
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          name text NOT NULL,
          ts timestamptz,
          encrypted_field text,
          buffer_field bytea,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          UNIQUE (name)
        )`,
      ],
      SCHEMA: schema,
      SHARD_AFFINITY: [],
    },
  ]);

  timeline.reset();
  shard = await testCluster.randomShard();
  master = await shard.client(MASTER);
  master.resetSnapshot();
  replica = await shard.client(timeline);
  replica.resetSnapshot();
});

async function shardRun<TOutput>(
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

test("CAS single success", async () => {
  const ts1 = new Date("2000-01-01T00:00:00.001Z");
  const ts1upd = new Date("2000-02-01T00:00:00.001Z");

  const [id1, id2] = await join([
    shardRun(
      schema.insert({
        name: "a",
        ts: ts1,
        encrypted_field: await EncryptedValue.encrypt("a", 42),
        buffer_field: Buffer.from([1, 2, 3]),
      })
    ),
    shardRun(schema.insert({ name: "b", ts: null })),
  ]);
  assert(id1 && id2);
  const [row1, row2] = await join([
    shardRun(schema.load(id1)),
    shardRun(schema.load(id2)),
  ]);
  assert(row1 && row2);
  master.resetSnapshot();

  const r1 = await shardRun(
    schema.update(nullthrows(id1), {
      name: "a-upd",
      ts: ts1upd,
      $cas: {
        name: "a",
        ts: ts1,
        encrypted_field: await EncryptedValue.encrypt("a", 42),
        buffer_field: Buffer.from([1, 2, 3]),
        updated_at: row1.updated_at,
      },
    })
  );
  const r2 = await shardRun(
    schema.update(nullthrows(id2), {
      name: "b-upd",
      ts: row2.updated_at,
      $cas: { name: "b", ts: null, updated_at: row2.updated_at },
    })
  );
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeTruthy();

  const rows = await join([
    shardRun(schema.load(id1)),
    shardRun(schema.load(id2)),
  ]);
  expect(rows).toMatchObject([
    { id: id1, name: "a-upd", ts: ts1upd },
    { id: id2, name: "b-upd", ts: row2.updated_at },
  ]);
});

test("CAS single skip", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a", ts: new Date() })),
    shardRun(
      schema.insert({
        name: "b",
        ts: null,
        buffer_field: Buffer.from([1, 2, 3]),
      })
    ),
  ]);
  assert(id1 && id2);
  const [row1, row2] = await join([
    shardRun(schema.load(id1)),
    shardRun(schema.load(id2)),
  ]);
  assert(row1 && row2);
  master.resetSnapshot();

  const r1Skip = await shardRun(
    schema.update(nullthrows(id1), {
      name: "a-skip",
      $cas: { name: "a-old", updated_at: row1.updated_at },
    })
  );
  const r2Skip = await shardRun(
    schema.update(nullthrows(id2), {
      name: "b-skip",
      $cas: { buffer_field: Buffer.from([4, 5, 6]) },
    })
  );
  master.toMatchSnapshot();

  expect(r1Skip).toBeFalsy();
  expect(r2Skip).toBeFalsy();

  const rows = await join([
    shardRun(schema.load(id1)),
    shardRun(schema.load(id2)),
  ]);
  expect(rows).toMatchObject([
    { id: id1, name: "a", ts: row1.ts, updated_at: row1.updated_at },
    { id: id2, name: "b", ts: null, updated_at: row2.updated_at },
  ]);
});

test("CAS batched success", async () => {
  const ts1 = new Date("2000-01-01T00:00:00.001Z");
  const ts1upd = new Date("2000-02-01T00:00:00.001Z");

  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a", ts: ts1 })),
    shardRun(schema.insert({ name: "b", ts: null })),
  ]);
  assert(id1 && id2);
  const [row1, row2] = await join([
    shardRun(schema.load(id1)),
    shardRun(schema.load(id2)),
  ]);
  assert(row1 && row2);
  master.resetSnapshot();

  const [r1, r2] = await join([
    shardRun(
      schema.update(nullthrows(id1), {
        name: "a-upd",
        ts: ts1upd,
        $cas: { name: "a", ts: ts1, updated_at: row1.updated_at },
      })
    ),
    shardRun(
      schema.update(nullthrows(id2), {
        name: "b-upd",
        ts: row2.updated_at,
        $cas: { name: "b", ts: null, updated_at: row2.updated_at },
      })
    ),
  ]);
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeTruthy();

  const rows = await join([
    shardRun(schema.load(id1)),
    shardRun(schema.load(id2)),
  ]);
  expect(rows).toMatchObject([
    { id: id1, name: "a-upd", ts: ts1upd },
    { id: id2, name: "b-upd", ts: row2.updated_at },
  ]);
});

test("CAS batched success and skip", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a", ts: new Date() })),
    shardRun(schema.insert({ name: "b", ts: null })),
  ]);
  assert(id1 && id2);
  const [row1, row2] = await join([
    shardRun(schema.load(id1)),
    shardRun(schema.load(id2)),
  ]);
  assert(row1 && row2);

  const [r1, r2] = await join([
    shardRun(
      schema.update(nullthrows(id1), {
        name: "a-upd",
        $cas: { name: "a", updated_at: row1.updated_at },
      })
    ),
    shardRun(
      schema.update(nullthrows(id2), {
        name: "b-upd",
        $cas: { name: "b-old", updated_at: row2.updated_at },
      })
    ),
  ]);
  expect(r1).toBeTruthy();
  expect(r2).toBeFalsy();

  const rows = await join([
    shardRun(schema.load(id1)),
    shardRun(schema.load(id2)),
  ]);
  expect(rows).toMatchObject([
    { id: id1, name: "a-upd" },
    { id: id2, name: "b", updated_at: row2.updated_at },
  ]);
});

test("CAS batched success and skip for the same row", async () => {
  const id1 = nullthrows(
    await shardRun(schema.insert({ name: "a", ts: new Date() }))
  );
  const row1 = nullthrows(await shardRun(schema.load(id1)));
  master.resetSnapshot();

  const [r1, r2] = await join([
    shardRun(
      schema.update(nullthrows(id1), {
        name: "a-upd",
        $cas: { name: "a", updated_at: row1.updated_at },
      })
    ),
    shardRun(
      schema.update(nullthrows(id1), {
        name: "a-skip",
        $cas: { name: "a", updated_at: new Date(42) },
      })
    ),
  ]);
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeFalsy();

  const rows = await join([shardRun(schema.load(id1))]);
  expect(rows).toMatchObject([{ id: id1, name: "a-upd" }]);
});
