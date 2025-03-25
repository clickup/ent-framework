import delay from "delay";
import range from "lodash/range";
import sortBy from "lodash/sortBy";
import { escapeIdent } from "..";
import type { Shard } from "../../abstract/Shard";
import { MASTER, STALE_REPLICA } from "../../abstract/Shard";
import { join, nullthrows } from "../../internal/misc";
import type { UpdateInput } from "../../types";
import { ID } from "../../types";
import { PgError } from "../PgError";
import { PgQueryDeleteWhere } from "../PgQueryDeleteWhere";
import { PgQueryIDGen } from "../PgQueryIDGen";
import { PgQueryInsert } from "../PgQueryInsert";
import { PgSchema } from "../PgSchema";
import type { TestPgClient } from "./test-utils";
import {
  EncryptedValue,
  TEST_TIMELINE,
  recreateTestTables,
  shardRun,
  testCluster,
} from "./test-utils";

const schema = new PgSchema(
  'pg-schema.generic"table',
  {
    name: { type: String },
    url_name: { type: String, allowNull: true },
    some_flag: { type: Boolean, allowNull: true, autoInsert: "false" },
    json_text_field: {
      type: {
        dbValueToJs: (v: string) =>
          JSON.parse(v) as { a: number; b: { c: number } },
        stringify: JSON.stringify,
        parse: JSON.parse,
      },
      allowNull: true,
      autoInsert: "NULL",
    },
    json_strongly_typed_field: {
      type: {
        dbValueToJs: (v: unknown) => v as { a: number }, // node-postgres does conversion from JSON internally
        stringify: JSON.stringify,
        parse: JSON.parse,
      },
      allowNull: true,
      autoInsert: "NULL",
    },
    jsonb_field: {
      type: {
        dbValueToJs: (v: unknown) => v, // node-postgres does conversion from JSON internally
        stringify: JSON.stringify,
        parse: JSON.parse,
      },
      allowNull: true,
      autoInsert: "NULL",
    },
    encrypted_field: {
      // This is another use-case, a fully custom class carrying a DB value. It
      // still works via the same parse/stringify framework, BUT we may
      // sometimes want to do asynchronous stuff in read/write path which just
      // can't be done in parse/stringify (since they operate below Ent/VC
      // abstraction layer).
      type: EncryptedValue,
      allowNull: true,
      autoInsert: "NULL",
    },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
    parent_id: { type: ID, allowNull: true, autoInsert: "NULL" },
    // id in the end since we pre-sort rows in UPDATE queries, and IDs
    // are random; we want to have consistent ordering of results across
    // tests runs to match the test snapshots
    id: { type: String, autoInsert: "id_gen()" },
  },
  ["name"],
);

const schemaNullableUniqueKey = new PgSchema(
  'pg-schema.generic"table_nullable_unique_key',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String, allowNull: true },
    url_name: { type: String, allowNull: true },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
  },
  ["url_name"],
);

const schema2Col = new PgSchema(
  'pg-schema.generic"table_2col',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
    url_name: { type: String },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
  },
  ["name", "url_name"],
);

const schema2ColNullableUniqueKey = new PgSchema(
  'pg-schema.generic"table_2col_nullable_unique_key',
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String, allowNull: true },
    url_name: { type: String, allowNull: true },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
  },
  ["name", "url_name"],
);

const schema3Col = new PgSchema(
  'pg-schema.generic"table_3col',
  {
    id: { type: String, autoInsert: "id_gen()" },
    type: { type: String },
    id1: { type: String },
    id2: { type: String },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
  },
  ["type", "id1", "id2"],
);

const schemaDate = new PgSchema(
  'pg-schema.generic"table_date',
  {
    date_id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
    some_date: { type: Date, allowNull: true, autoInsert: "NULL" },
  },
  ["date_id"],
);

let shard: Shard<TestPgClient>;
let master: TestPgClient;
let replica: TestPgClient;

beforeEach(async () => {
  await recreateTestTables([
    {
      CREATE: [
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          name varchar(1024) NOT NULL,
          url_name text,
          some_flag boolean,
          json_text_field text,
          json_strongly_typed_field json,
          jsonb_field jsonb,
          encrypted_field text,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          parent_id bigint,
          UNIQUE (name)
        )`,
        "ALTER TABLE %T ADD CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) REFERENCES %T(id)",
      ],
      SCHEMA: schema,
      SHARD_AFFINITY: [],
    },
    {
      CREATE: [
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          name text,
          url_name text,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          UNIQUE (url_name)
        )`,
      ],
      SCHEMA: schemaNullableUniqueKey,
      SHARD_AFFINITY: [],
    },
    {
      CREATE: [
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          name text NOT NULL,
          url_name text NOT NULL,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          UNIQUE (name, url_name)
        )`,
      ],
      SCHEMA: schema2Col,
      SHARD_AFFINITY: [],
    },
    {
      CREATE: [
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          name text,
          url_name text,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          UNIQUE (name, url_name)
        )`,
      ],
      SCHEMA: schema2ColNullableUniqueKey,
      SHARD_AFFINITY: [],
    },
    {
      CREATE: [
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          type text NOT NULL,
          id1 text NOT NULL,
          id2 text NOT NULL,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          UNIQUE (type, id1, id2)
        )`,
      ],
      SCHEMA: schema3Col,
      SHARD_AFFINITY: [],
    },
    {
      CREATE: [
        `CREATE TABLE %T(
          date_id bigint NOT NULL PRIMARY KEY,
          name text,
          some_date timestamptz
        )`,
      ],
      SCHEMA: schemaDate,
      SHARD_AFFINITY: [],
    },
  ]);

  shard = await testCluster.randomShard();
  master = await shard.client(MASTER);
  master.resetSnapshot();
  replica = await shard.client(TEST_TIMELINE);
  replica.resetSnapshot();
});

test("idGen single", async () => {
  master.resetSnapshot();
  const id1 = await shardRun(shard, schema.idGen());
  const id2 = await shardRun(shard, schema.idGen());
  master.toMatchSnapshot();
  expect(id1).not.toEqual(id2);
});

test("idGen batched", async () => {
  master.resetSnapshot();
  const [id1, id2] = await join([
    shardRun(shard, schema.idGen()),
    shardRun(shard, schema.idGen()),
  ]);
  master.toMatchSnapshot();
  expect(id1).not.toEqual(id2);
});

test("idGen with large batch", async () => {
  const query = new PgQueryIDGen(schema);
  const maxBatchSize = new query.RUNNER_CLASS(schema, master.client)
    .maxBatchSize;
  master.resetSnapshot();
  await join(
    range(maxBatchSize * 2 - 10).map(async () =>
      shardRun(shard, schema.idGen()),
    ),
  );
  expect(master.queries).toHaveLength(2);
});

test("insert single", async () => {
  const id1Gen = await shardRun(shard, schema.idGen());
  const id1 = await shardRun(
    shard,
    schema.insert({
      name: "a'b\x00'c",
      url_name: "aaa",
      some_flag: true,
      json_text_field: { a: 10, b: { c: 20 } },
      json_strongly_typed_field: { a: 42 },
      jsonb_field: { a: 42 },
      encrypted_field: await EncryptedValue.encrypt("text", 1),
      id: id1Gen,
    }),
  );
  const id2 = await shardRun(
    shard,
    schema.insert({ name: "a'b'c", url_name: "aaa_dup" }),
  );
  master.toMatchSnapshot();

  expect(id1).toEqual(id1Gen);
  const row = await shardRun(shard, schema.load(id1!));
  expect(row).toMatchObject({
    name: "a'b'c",
    some_flag: true,
    json_text_field: { a: 10, b: { c: 20 } },
    json_strongly_typed_field: { a: 42 },
    jsonb_field: { a: 42 },
  });
  expect(await row!.encrypted_field!.decrypt(1)).toEqual("text");

  expect(id2).toBeNull();
});

test("insert pre-generated id with uniq key violation", async () => {
  const id1 = await shardRun(shard, schema.idGen());
  const id2 = await shardRun(shard, schema.idGen());
  const [res1, res2] = await join([
    shardRun(shard, schema.insert({ id: id1, name: "some", url_name: "aaa" })),
    shardRun(shard, schema.insert({ id: id2, name: "some", url_name: "aaa" })),
  ]);
  master.toMatchSnapshot();
  expect(res1 === null || res2 === null).toBeTruthy();
});

test("insert batched", async () => {
  const id2Gen = await shardRun(shard, schema.idGen());
  const [id1, id2, id3] = await join([
    shardRun(
      shard,
      schema.insert({
        name: "z'b'c",
        url_name: null,
        some_flag: true,
        jsonb_field: null,
      }),
    ),
    shardRun(
      shard,
      schema.insert({ name: "a", url_name: "u", some_flag: null, id: id2Gen }),
    ),
    shardRun(shard, schema.insert({ name: "a", url_name: "u_dup" })),
  ]);
  master.toMatchSnapshot();

  const rows = await join([
    shardRun(shard, schema.load(id1!)),
    shardRun(shard, schema.load(id2!)),
  ]);
  expect(rows).toMatchObject([
    { name: "z'b'c", some_flag: true, jsonb_field: null },
    { name: "a", url_name: "u", some_flag: null, id: id2Gen },
  ]);

  expect(id3).toBeNull();
});

test("insert large batch", async () => {
  const query = new PgQueryInsert(schema, { name: "", url_name: null });
  const maxBatchSize = new query.RUNNER_CLASS(schema, master.client)
    .maxBatchSize;
  master.resetSnapshot();
  await join(
    range(maxBatchSize * 2 - 10).map(async (i) =>
      shardRun(shard, schema.insert({ name: `aaa${i}`, url_name: `uuu${i}` })),
    ),
  );
  expect(master.queries).toHaveLength(2);
});

test("insert is never dedupped", async () => {
  const [id1, id2] = await join([
    shardRun(
      shard,
      schema.insert({ name: "aaa", url_name: "uuu", some_flag: null }),
    ),
    shardRun(
      shard,
      schema.insert({ name: "aaa", url_name: "uuu", some_flag: null }),
    ),
  ]);
  master.toMatchSnapshot();
  expect((id1 === null) !== (id2 === null)).toBeTruthy();
});

test("insert de-batches pg error", async () => {
  const [res1, res2] = await join([
    shardRun(
      shard,
      // should succeed
      schema.insert({ name: "some", url_name: null }),
    ).catch((e) => e),
    shardRun(
      shard,
      // should fail with FK constraint error
      schema.insert({ name: "other", url_name: null, parent_id: "0" }),
    ).catch((e) => e),
  ]);
  master.toMatchSnapshot();
  expect(typeof res1).toEqual("string");
  expect(res2).toBeInstanceOf(PgError);
  expect(res2.isFKError()).toBeTruthy();
  expect(res2.isFKError("fk_parent_id")).toBeTruthy();
});

test("insert de-batches pg error: data type: varchar", async () => {
  const [res1, res2] = await join([
    shardRun(
      shard,
      // should succeed
      schema.insert({ name: "some", url_name: null }),
    ).catch((e) => e),
    shardRun(
      shard,
      // should fail with "value too long for type character varying" error
      schema.insert({ name: `l${"o".repeat(1024)}g`, url_name: null }),
    ).catch((e) => e),
  ]);
  master.toMatchSnapshot();
  expect(typeof res1).toEqual("string");
  expect(res2).toBeInstanceOf(PgError);
  expect(res2.message).toContain("value too long for type character varying");
});

test("insert de-batches pg error: data type: bigint", async () => {
  const [res1, res2] = await join([
    shardRun(
      shard,
      // should succeed
      schema.insert({ name: "some", url_name: null }),
    ).catch((e) => e),
    shardRun(
      shard,
      // should fail with "invalid input syntax for type bigint" error
      schema.insert({
        name: "other",
        url_name: null,
        id: "not a bigint",
      }),
    ).catch((e) => e),
  ]);
  master.toMatchSnapshot();
  expect(typeof res1).toEqual("string");
  expect(res2).toBeInstanceOf(PgError);
  expect(res2.message).toContain("invalid input syntax for type bigint");
});

test("upsert single", async () => {
  const id1 = await shardRun(
    shard,
    schema.upsert({ name: "a'b'c", url_name: "aaa" }),
  );
  const origRow1 = await master.rows(
    "SELECT created_at FROM %T WHERE id=?",
    ...[schema.name, id1],
  );
  await delay(20); // to check that created_at is constant

  const id2 = await shardRun(
    shard,
    schema.upsert({ name: "a'b'c", url_name: "aaa_dup" }),
  );
  const id3 = await shardRun(
    shard,
    schema.upsert({ name: "zzz", url_name: "n" }),
  );
  master.toMatchSnapshot();

  expect(id2).toEqual(id1);
  const rows = await master.rows(
    "SELECT id, name, created_at FROM %T ORDER BY NAME",
    ...[schema.name, id1],
  );
  expect(rows).toMatchObject([
    { id: id1, name: "a'b'c", created_at: origRow1[0]["created_at"] },
    { id: id3, name: "zzz" },
  ]);
});

test("upsert batched does not mess up the rows order", async () => {
  const [id1, id2, id3] = await join([
    shardRun(shard, schema.upsert({ name: "zzz", url_name: "zzz" })),
    shardRun(shard, schema.upsert({ name: "bbb", url_name: "bbb" })),
    shardRun(shard, schema.upsert({ name: "ccc", url_name: "ccc" })),
  ]);
  master.toMatchSnapshot();
  const [row1, row2, row3] = await join([
    shardRun(shard, schema.load(id1)),
    shardRun(shard, schema.load(id2)),
    shardRun(shard, schema.load(id3)),
  ]);
  expect(row1).toMatchObject({ name: "zzz" });
  expect(row2).toMatchObject({ name: "bbb" });
  expect(row3).toMatchObject({ name: "ccc" });
});

test("upsert batched normal", async () => {
  const [id1, id2, id3] = await join([
    shardRun(shard, schema.upsert({ name: "a'b'c", url_name: "aaa" })),
    shardRun(shard, schema.upsert({ name: "bbb", url_name: "bbb" })),
    shardRun(shard, schema.upsert({ name: "ccc", url_name: "ccc" })),
  ]);
  master.resetSnapshot();

  const [r1, r2, r4, r4dup] = await join([
    shardRun(shard, schema.upsert({ name: "a'b'c", url_name: "aaa_new" })),
    shardRun(shard, schema.upsert({ name: "bbb", url_name: "bbb_new" })),
    shardRun(shard, schema.upsert({ name: "zzz", url_name: "zzz" })),
    shardRun(shard, schema.upsert({ name: "zzz", url_name: "zzz_dup" })),
  ]);
  master.toMatchSnapshot();

  expect(r1).toEqual(id1);
  expect(r2).toEqual(id2);
  expect(r4dup).toEqual(r4);

  const rows = await master.rows(
    "SELECT id, name, url_name FROM %T ORDER BY name",
    schema.name,
  );
  expect(rows).toMatchObject([
    { id: id1, url_name: "aaa_new" },
    { id: id2, url_name: "bbb_new" },
    { id: id3, url_name: "ccc" },
    { id: r4, name: "zzz", url_name: "zzz_dup" },
  ]);
});

test("upsert batched with nullable unique key", async () => {
  const [id0] = await join([
    shardRun(
      shard,
      schemaNullableUniqueKey.upsert({ name: "000", url_name: "0" }),
    ),
  ]);
  const [id1, id2, id3] = await join([
    shardRun(
      shard,
      schemaNullableUniqueKey.upsert({ name: "a'b'c", url_name: null }),
    ),
    shardRun(
      shard,
      schemaNullableUniqueKey.upsert({ name: "bbb", url_name: null }),
    ),
    shardRun(
      shard,
      schemaNullableUniqueKey.upsert({ name: "ccc", url_name: null }),
    ),
  ]);
  master.toMatchSnapshot();

  expect(id0 === id1).toBeFalsy();
  expect(id1 === id2).toBeFalsy();
  expect(id2 === id3).toBeFalsy();

  const rows = await master.rows(
    "SELECT id, name, url_name FROM %T ORDER BY name",
    schemaNullableUniqueKey.name,
  );
  expect(rows).toMatchObject([
    { id: id0, name: "000", url_name: "0" },
    { id: id1, name: "a'b'c", url_name: null },
    { id: id2, name: "bbb", url_name: null },
    { id: id3, name: "ccc", url_name: null },
  ]);
});

test("update single", async () => {
  const [id1, id2, id3] = await join([
    shardRun(shard, schema.insert({ name: "a'url", url_name: "a" })),
    shardRun(shard, schema.insert({ name: "b'url", url_name: "b" })),
    shardRun(shard, schema.insert({ name: "null'url", url_name: null })),
  ]);

  const origRows = await join([
    shardRun(shard, schema.load(id1!)),
    shardRun(shard, schema.load(id2!)),
    shardRun(shard, schema.load(id3!)),
  ]);
  await delay(20); // to check updated_at change

  master.resetSnapshot();
  await shardRun(shard, schema.update(nullthrows(id1), {})); // no DB query is sent here
  const [r1, r2, r3] = await join([
    shardRun(shard, schema.update(nullthrows(id1), { name: "a'upd" })),
    shardRun(
      shard,
      schema.update(nullthrows(id2), {
        name: "b'upd",
        url_name: null,
        some_flag: true,
      }),
    ),
    shardRun(shard, schema.update(nullthrows(id3), { url_name: "n" })),
  ]);
  const r4 = await shardRun(shard, schema.update("42", { name: "absent" }));
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeTruthy();
  expect(r3).toBeTruthy();
  expect(r4).toBeFalsy();

  const rows = await join([
    shardRun(shard, schema.load(id1!)),
    shardRun(shard, schema.load(id2!)),
    shardRun(shard, schema.load(id3!)),
  ]);
  expect(rows).toMatchObject([
    { id: id1, name: "a'upd", url_name: "a" },
    { id: id2, name: "b'upd", url_name: null, some_flag: true },
    { id: id3, name: "null'url", url_name: "n" },
  ]);
  expect(rows[2]!.updated_at.getTime()).toBeGreaterThan(
    origRows[2]!.updated_at.getTime(),
  );
});

test("update skips if no known fields present", async () => {
  const [id1, id2] = await join([
    shardRun(shard, schema.insert({ name: "a'url", url_name: "a" })),
    shardRun(shard, schema.insert({ name: "b'url", url_name: "b" })),
  ]);
  master.resetSnapshot();

  const unrelatedFields = {
    unrelated: 123,
    [Symbol("symbol")]: 42,
  } as UpdateInput<typeof schema.table>;
  const [r1, r2, r3] = await join([
    shardRun(shard, schema.update(nullthrows(id1), unrelatedFields)),
    shardRun(shard, schema.update(nullthrows(id2), unrelatedFields)),
    shardRun(shard, schema.update("101", unrelatedFields)),
  ]);
  const r4 = await shardRun(
    shard,
    schema.update(nullthrows(id1), unrelatedFields),
  );
  const r5 = await shardRun(shard, schema.update("42", { name: "absent" }));

  master.toMatchSnapshot(); // only r5 update will actually be sent to the DB
  expect(r1).toBeTruthy();
  expect(r2).toBeTruthy();
  expect(r3).toBeTruthy(); // although there is no such row, we still return true since the DB query is skipped
  expect(r4).toBeTruthy();
  expect(r5).not.toBeTruthy();
});

test("update batched", async () => {
  const [id1, id2, id3] = await join([
    shardRun(shard, schema.insert({ name: "a'url", url_name: "a" })),
    shardRun(shard, schema.insert({ name: "b'url", url_name: "b" })),
    shardRun(shard, schema.insert({ name: "null'url", url_name: null })),
  ]);
  master.resetSnapshot();

  await join([
    shardRun(shard, schema.update(nullthrows(id1), {})),
    shardRun(shard, schema.update(nullthrows(id2), {})),
  ]);
  const [r1, r2, r3, r3dup, r4] = await join([
    shardRun(
      shard,
      schema.update(nullthrows(id1), { name: "a'upd", some_flag: true }),
    ),
    shardRun(
      shard,
      schema.update(nullthrows(id2), {
        name: "b'upd",
        url_name: null,
      }),
    ),
    shardRun(
      shard,
      schema.update(nullthrows(id3), {
        name: "null'upd",
        url_name: "n",
      }),
    ),
    shardRun(
      shard,
      schema.update(nullthrows(id3), {
        name: "null'upd",
        url_name: "n1",
      }),
    ),
    shardRun(shard, schema.update("42", { name: "absent", some_flag: true })),
  ]);
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeTruthy();
  expect(r3).toBeTruthy();
  expect(r3dup).toBeTruthy();
  expect(r4).toBeFalsy();

  const rows = await join([
    shardRun(shard, schema.load(id1!)),
    shardRun(shard, schema.load(id2!)),
    shardRun(shard, schema.load(id3!)),
  ]);
  expect(rows).toMatchObject([
    { id: id1, name: "a'upd", url_name: "a", some_flag: true },
    { id: id2, name: "b'upd", url_name: null },
    { id: id3, name: "null'upd", url_name: "n1" },
  ]);
});

test("update date", async () => {
  const [id1, id2] = await join([
    shardRun(
      shard,
      schemaDate.insert({ name: "a", some_date: new Date(1234567890) }),
    ),
    shardRun(shard, schemaDate.insert({ name: "b" })),
  ]);
  master.resetSnapshot();

  await shardRun(shard, schemaDate.update(id1!, { some_date: undefined }));
  await shardRun(
    shard,
    schemaDate.update(id2!, { name: "bb", some_date: undefined }),
  );
  await join([
    shardRun(shard, schemaDate.update(id1!, { some_date: undefined })),
    shardRun(shard, schemaDate.update(id2!, { some_date: undefined })),
  ]);
  master.toMatchSnapshot();

  const [row1, row2] = await join([
    shardRun(shard, schemaDate.load(id1!)),
    shardRun(shard, schemaDate.load(id2!)),
  ]);
  expect(row1!.some_date).toBeTruthy();
  expect(row2!.name).toEqual("bb");
});

test("update literal", async () => {
  const [id1, id2] = await join([
    shardRun(shard, schema.insert({ name: "a", url_name: "a" })),
    shardRun(shard, schema.insert({ name: "b", url_name: "b" })),
  ]);
  master.resetSnapshot();

  await join([
    shardRun(
      shard,
      schema.update(id1!, { $literal: ["name = name || ?", 42] }),
    ),
    shardRun(shard, schema.update(id2!, { name: "bbb" })),
    shardRun(
      shard,
      schema.update(id1!, { $literal: ["name = name || ?", 42] }),
    ),
    shardRun(
      shard,
      schemaDate.update("42", { $literal: ["name = name || ?", 42] }),
    ),
  ]);
  master.toMatchSnapshot();

  const [row1, row2] = await join([
    shardRun(shard, schema.load(id1!)),
    shardRun(shard, schema.load(id2!)),
  ]);
  expect(row1!.name).toEqual("a4242");
  expect(row2!.name).toEqual("bbb");
});

test("delete single", async () => {
  const [id1, id2] = await join([
    shardRun(shard, schema.insert({ name: "a", url_name: "a" })),
    shardRun(shard, schema.insert({ name: "b", url_name: "b" })),
  ]);
  master.resetSnapshot();

  const r1 = await shardRun(shard, schema.delete(nullthrows(id1)));
  const r2 = await shardRun(shard, schema.delete("42"));
  const r3 = await shardRun(shard, schema.delete(null as unknown as string));
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeFalsy();
  expect(r3).toBeFalsy();

  const rows = await join([
    shardRun(shard, schema.load(id1!)),
    shardRun(shard, schema.load(id2!)),
  ]);
  expect(rows).toMatchObject([null, { id: id2 }]);
});

test("delete batched", async () => {
  const [id1, id2, id3] = await join([
    shardRun(shard, schema.insert({ name: "a", url_name: "a" })),
    shardRun(shard, schema.insert({ name: "b", url_name: "b" })),
    shardRun(shard, schema.insert({ name: "n", url_name: null })),
  ]);
  master.resetSnapshot();

  const [r1, r2, r3] = await join([
    shardRun(shard, schema.delete(nullthrows(id1))),
    shardRun(shard, schema.delete(nullthrows(id2))),
    shardRun(shard, schema.delete("42")),
    shardRun(shard, schema.delete(null as unknown as string)),
  ]);
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeTruthy();
  expect(r3).toBeFalsy();

  const rows = await join([
    shardRun(shard, schema.load(id1!)),
    shardRun(shard, schema.load(id2!)),
    shardRun(shard, schema.load(id3!)),
  ]);
  expect(rows).toMatchObject([null, null, { id: id3 }]);
});

test("delete where", async () => {
  const [id1, id2] = await join([
    shardRun(shard, schema.insert({ name: "a", url_name: "a" })),
    shardRun(shard, schema.insert({ name: "b", url_name: "b" })),
  ]);
  master.resetSnapshot();

  const res = await shardRun(
    shard,
    new PgQueryDeleteWhere(schema, { id: [id1!, id2!], $literal: ["1=1"] }),
  );
  master.toMatchSnapshot();
  expect(res.length).toEqual(2);

  const rows = await join([
    shardRun(shard, schema.load(id1!)),
    shardRun(shard, schema.load(id2!)),
  ]);
  expect(rows).toEqual([null, null]);
});

test("load batched", async () => {
  const [id1, id2] = await join([
    shardRun(shard, schema.insert({ name: "a", url_name: "a" })),
    shardRun(shard, schema.insert({ name: "b", url_name: "b" })),
  ]);

  master.resetSnapshot();
  const rows = await join([
    shardRun(shard, schema.load(id1!)),
    shardRun(shard, schema.load(id2!)),
    shardRun(shard, schema.load(id1!)),
  ]);
  master.toMatchSnapshot();
  expect(rows).toMatchObject([{ id: id1 }, { id: id2 }, { id: id1 }]);
});

test("loadBy single one column", async () => {
  const [, id2] = await join([
    shardRun(shard, schema.insert({ name: "a", url_name: "aaa" })),
    shardRun(shard, schema.insert({ name: "b", url_name: "bbb" })),
  ]);

  const row = await shardRun(
    shard,
    schema.loadBy({ name: "b" }),
    STALE_REPLICA,
  );
  replica.toMatchSnapshot();
  expect(row).toMatchObject({ id: id2, name: "b" });
});

test("loadBy batched one column", async () => {
  const [id1, id2] = await join([
    shardRun(shard, schema.insert({ name: String.raw`a\a`, url_name: "aaa" })),
    shardRun(shard, schema.insert({ name: String.raw`b\nb`, url_name: "bbb" })),
  ]);

  master.resetSnapshot();
  const rows = await join([
    shardRun(shard, schema.loadBy({ name: String.raw`a\a` })),
    shardRun(shard, schema.loadBy({ name: String.raw`b\nb` })),
    shardRun(shard, schema.loadBy({ name: "no value" })),
    shardRun(shard, schema.loadBy({ name: String.raw`a\a` })),
  ]);
  master.toMatchSnapshot();
  expect(rows).toMatchObject([{ id: id1 }, { id: id2 }, null, { id: id1 }]);
});

test("loadBy single two columns", async () => {
  const [, id2] = await join([
    shardRun(shard, schema2Col.insert({ name: "a", url_name: "aaa" })),
    shardRun(shard, schema2Col.insert({ name: "b", url_name: "bbb" })),
  ]);

  master.resetSnapshot();
  const row = await shardRun(
    shard,
    schema2Col.loadBy({ name: "b", url_name: "bbb" }),
  );
  master.toMatchSnapshot();
  expect(row).toMatchObject({ id: id2, name: "b" });
});

test("loadBy batched two columns", async () => {
  const [id1, id2, id3, id4, id5] = await join([
    shardRun(shard, schema2Col.insert({ name: "z", url_name: "z1" })),
    shardRun(shard, schema2Col.insert({ name: "z", url_name: "z,2" })),
    shardRun(shard, schema2Col.insert({ name: "b", url_name: "b{1}" })),
    shardRun(shard, schema2Col.insert({ name: "c", url_name: "NuLL" })),
    shardRun(shard, schema2Col.insert({ name: "c", url_name: "" })),
  ]);

  master.resetSnapshot();
  const rows = await join([
    shardRun(shard, schema2Col.loadBy({ name: "z", url_name: "z1" })),
    shardRun(shard, schema2Col.loadBy({ name: "z", url_name: "z,2" })),
    shardRun(
      shard,
      schema2Col.loadBy({ name: "b", url_name: String.raw`no\value` }),
    ),
    shardRun(shard, schema2Col.loadBy({ name: "b", url_name: "b{1}" })),
    shardRun(shard, schema2Col.loadBy({ name: "c", url_name: "NuLL" })),
    shardRun(shard, schema2Col.loadBy({ name: "c", url_name: "" })),
  ]);
  master.toMatchSnapshot();
  expect(rows).toMatchObject([
    { id: id1 },
    { id: id2 },
    null,
    { id: id3 },
    { id: id4 },
    { id: id5 },
  ]);
});

test("loadBy single two columns with nullable unique key", async () => {
  const [, id2] = await join([
    shardRun(
      shard,
      schema2ColNullableUniqueKey.insert({ name: "a", url_name: "aaa" }),
    ),
    shardRun(
      shard,
      schema2ColNullableUniqueKey.insert({ name: "b", url_name: null }),
    ),
  ]);

  master.resetSnapshot();
  const row = await shardRun(
    shard,
    schema2ColNullableUniqueKey.loadBy({ name: "b", url_name: null }),
  );
  await shardRun(
    shard,
    schema2ColNullableUniqueKey.loadBy({ name: null, url_name: "a" }),
  );
  await shardRun(
    shard,
    schema2ColNullableUniqueKey.loadBy({ name: null, url_name: null }),
  );
  master.toMatchSnapshot();
  expect(row).toMatchObject({ id: id2, name: "b" });
});

test("loadBy batched with two columns nullable unique key", async () => {
  const [id1, id2, id3, id4, id5] = await join([
    shardRun(
      shard,
      schema2ColNullableUniqueKey.insert({ name: "z", url_name: "z1" }),
    ),
    shardRun(
      shard,
      schema2ColNullableUniqueKey.insert({ name: "z", url_name: "z2" }),
    ),
    shardRun(
      shard,
      schema2ColNullableUniqueKey.insert({ name: "b", url_name: null }),
    ),
    shardRun(
      shard,
      schema2ColNullableUniqueKey.insert({ name: "c", url_name: null }),
    ),
    shardRun(
      shard,
      schema2ColNullableUniqueKey.insert({ name: "c", url_name: "c2" }),
    ),
  ]);

  master.resetSnapshot();
  const rows = await join([
    shardRun(
      shard,
      schema2ColNullableUniqueKey.loadBy({ name: "z", url_name: "z1" }),
    ),
    shardRun(
      shard,
      schema2ColNullableUniqueKey.loadBy({ name: "z", url_name: "z2" }),
    ),
    shardRun(
      shard,
      schema2ColNullableUniqueKey.loadBy({ name: "no", url_name: "Null" }),
    ),
    shardRun(
      shard,
      schema2ColNullableUniqueKey.loadBy({ name: "b", url_name: null }),
    ),
    shardRun(
      shard,
      schema2ColNullableUniqueKey.loadBy({ name: "c", url_name: null }),
    ),
    shardRun(
      shard,
      schema2ColNullableUniqueKey.loadBy({ name: "c", url_name: "c2" }),
    ),
  ]);
  master.toMatchSnapshot();
  expect(rows).toMatchObject([
    { id: id1 },
    { id: id2 },
    null,
    { id: id3 },
    { id: id4 },
    { id: id5 },
  ]);
});

test("selectBy single three columns", async () => {
  const [id1, id2] = await join([
    shardRun(shard, schema3Col.insert({ type: "a", id1: "1", id2: "21" })),
    shardRun(shard, schema3Col.insert({ type: "a", id1: "1", id2: "22" })),
  ]);

  master.resetSnapshot();
  const rows = await shardRun(
    shard,
    schema3Col.selectBy({ type: "a", id1: "1" }),
  );
  master.toMatchSnapshot();
  expect(sortBy(rows, (row) => row.id2)).toMatchObject([
    { id: id1, type: "a", id1: "1", id2: "21" },
    { id: id2, type: "a", id1: "1", id2: "22" },
  ]);
});

test("selectBy batched three columns", async () => {
  const [id1, id2, id3, id4] = await join([
    shardRun(shard, schema3Col.insert({ type: "a", id1: "1", id2: "21" })),
    shardRun(shard, schema3Col.insert({ type: "a", id1: "1", id2: "22" })),
    shardRun(shard, schema3Col.insert({ type: "a", id1: "2", id2: "23" })),
    shardRun(shard, schema3Col.insert({ type: "b", id1: "1", id2: "24" })),
  ]);

  master.resetSnapshot();
  const [rows1, rows2, rows3, rows4] = await join([
    shardRun(shard, schema3Col.selectBy({ type: "a", id1: "1" })),
    shardRun(shard, schema3Col.selectBy({ type: "a", id1: "2" })),
    shardRun(shard, schema3Col.selectBy({ type: "b", id1: "1" })),
    shardRun(shard, schema3Col.selectBy({ type: "b" })),
  ]);
  master.toMatchSnapshot();
  expect(sortBy(rows1, (row) => row.id2)).toMatchObject([
    { id: id1, type: "a", id1: "1", id2: "21" },
    { id: id2, type: "a", id1: "1", id2: "22" },
  ]);
  expect(sortBy(rows2, (row) => row.id2)).toMatchObject([
    { id: id3, type: "a", id1: "2", id2: "23" },
  ]);
  expect(sortBy(rows3, (row) => row.id2)).toMatchObject([
    { id: id4, type: "b", id1: "1", id2: "24" },
  ]);
  expect(sortBy(rows4, (row) => row.id2)).toMatchObject([
    { id: id4, type: "b", id1: "1", id2: "24" },
  ]);
});

test("select and count batched", async () => {
  const [id1, id2] = await join([
    shardRun(
      shard,
      schema.insert({ name: "a\na", url_name: "a1", some_flag: true }),
    ),
    shardRun(
      shard,
      schema.insert({
        name: String.raw`a\a`,
        url_name: "aa1",
        some_flag: true,
      }),
    ),
    shardRun(shard, schema.insert({ name: "c", url_name: "c1" })),
    shardRun(shard, schema.insert({ name: "d", url_name: "d1" })),
    shardRun(shard, schema.insert({ name: "e", url_name: "ce1" })),
  ]);
  master.resetSnapshot();

  const input: Parameters<typeof schema.select>[0] = {
    order: [{ name: "ASC" }, { url_name: "DESC" }, { $literal: ["1=?", 2] }],
    where: {
      name: ["a\na", String.raw`a\a`],
      some_flag: true,
      $or: [
        { name: "a\na" },
        { name: String.raw`a\a` },
        { url_name: [] },
        { url_name: [null, "zzz"] },
      ],
      $and: [
        { name: ["a\na", String.raw`a\a`] },
        { name: { $ne: "kk" } },
        { name: { $isDistinctFrom: "dd" } },
        { url_name: { $isDistinctFrom: null } },
        { url_name: { $ne: ["kk", null] } },
        { url_name: { $ne: [] } },
        { $literal: ["? > '2'", "5"] },
        { name: { $lte: "z", $gte: "a" } },
      ],
      $not: { name: "zz", $literal: ["? < '2'", 5] },
    },
    limit: 10,
  };
  const [rows1] = await join([
    shardRun(shard, schema.select(input)),
    shardRun(shard, schema.select({ where: { name: "b" }, limit: 10 })),
  ]);

  const [count1, count2, count3, count4] = await join([
    shardRun(shard, schema.count(input.where!)),
    shardRun(shard, schema.count(input.where!)),
    shardRun(shard, schema.count({ ...input.where!, url_name: "a1" })),
    shardRun(shard, schema.count({ name: "b" })),
  ]);
  const count5 = await shardRun(shard, schema.count(input.where!));

  const [exists1, exists2, exists3, exists4] = await join([
    shardRun(shard, schema.exists(input.where!)),
    shardRun(shard, schema.exists(input.where!)),
    shardRun(shard, schema.exists({ ...input.where!, url_name: "a1" })),
    shardRun(shard, schema.exists({ name: "b" })),
  ]);
  const exists5 = await shardRun(shard, schema.exists(input.where!));

  master.toMatchSnapshot();
  expect(rows1).toMatchObject([{ id: id1 }, { id: id2 }]);
  expect(count1).toEqual(2);
  expect(count2).toEqual(2);
  expect(count3).toEqual(1);
  expect(count4).toEqual(0);
  expect(count5).toEqual(2);
  expect(exists1).toStrictEqual(true);
  expect(exists2).toStrictEqual(true);
  expect(exists3).toStrictEqual(true);
  expect(exists4).toStrictEqual(false);
  expect(exists5).toStrictEqual(true);
});

test("select custom", async () => {
  const [id1, id2] = await join([
    shardRun(shard, schema.insert({ name: "a", url_name: "a1" })),
    shardRun(shard, schema.insert({ name: "b", url_name: "b1" })),
  ]);
  master.resetSnapshot();

  const input: Parameters<typeof schema.select>[0] = {
    where: {
      name: ["a", "aa"],
      $literal: ["? > '2'", "5"],
    },
    order: [{ name: "ASC" }, { $literal: ["cte1_v"] }],
    limit: 10,
    custom: {
      ctes: [
        ["cte1 AS (SELECT 1+? AS cte1_v FROM generate_series(1,1))", "1"],
        ["cte2 AS (SELECT 10+? AS cte2_v)", "10"],
      ],
      joins: [
        ["JOIN cte1 ON true", "1"],
        ["JOIN (SELECT 10+? AS join2_v) join2 ON true", "10"],
      ],
      hints: {
        enable_seqscan: "off",
      },
    },
  };

  const [rows1] = await join([shardRun(shard, schema.select(input))]);
  expect(rows1).toMatchObject([{ id: id1 }]);

  const [rows1a, rows2] = await join([
    shardRun(shard, schema.select(input)),
    shardRun(
      shard,
      schema.select({
        where: { name: "b" },
        limit: 10,
        custom: { hints: { enable_seqscan: "off" } },
      }),
    ),
    shardRun(shard, schema.select({ where: { name: "c" }, limit: 10 })),
  ]);
  expect(rows1a).toMatchObject([{ id: id1 }]);
  expect(rows2).toMatchObject([{ id: id2 }]);

  master.toMatchSnapshot();
});

test("rawPrepend hint", async () => {
  const [id1, id2] = await join([
    shardRun(shard, schema.insert({ name: "a", url_name: "a1" })),
    shardRun(shard, schema.insert({ name: "b", url_name: "b1" })),
  ]);
  master.resetSnapshot();

  const [rows1, rows2] = await join([
    shardRun(
      shard,
      schema.select({
        where: { name: "a" },
        limit: 10,
        custom: {
          hints: { "": `/*+SeqScan(${escapeIdent(schema.name)})*/` },
        },
      }),
    ),
    shardRun(
      shard,
      schema.select({
        where: { name: "b" },
        limit: 10,
        custom: {
          hints: { "": `/*+SeqScan(${escapeIdent(schema.name)})*/` },
        },
      }),
    ),
  ]);
  expect(rows1).toMatchObject([{ id: id1 }]);
  expect(rows2).toMatchObject([{ id: id2 }]);
  master.toMatchSnapshot();
});

test("test empty $or and $and", async () => {
  await join([
    shardRun(
      shard,
      schema.insert({ name: "a", url_name: "a1", some_flag: true }),
    ),
    shardRun(
      shard,
      schema.insert({ name: "aa", url_name: "aa1", some_flag: true }),
    ),
  ]);

  const [all, emptyOR, emptyAND] = await join([
    shardRun(shard, schema.select({ where: {}, limit: 2 })),
    shardRun(shard, schema.select({ where: { $or: [] }, limit: 2 })),
    shardRun(shard, schema.select({ where: { $and: [] }, limit: 2 })),
  ]);
  expect(all.length).toBe(2);
  expect(emptyOR.length).toBe(0);
  expect(emptyAND.length).toBe(0);
});
