import delay from "delay";
import { Query } from "../../abstract/Query";
import { MASTER, Shard, STALE_REPLICA } from "../../abstract/Shard";
import { Timeline } from "../../abstract/Timeline";
import { join, nullthrows } from "../../helpers";
import { ID } from "../../types";
import { SQLError } from "../SQLError";
import { SQLQueryDeleteWhere } from "../SQLQueryDeleteWhere";
import { SQLSchema } from "../SQLSchema";
import { testCluster, TestSQLClient } from "./helpers/TestSQLClient";

const TABLE = 'schema"test';
const TABLE_NULLABLE_UNIQUE_KEY = 'schema"test_nullable_unique_key';
const TABLE_2COL = 'schema"test_2col';
const TABLE_2COL_NULLABLE_UNIQUE_KEY = "schema_test_2col_nullable_unique_key";
const TABLE_DATE = "schema-te[st],_date";
const timeline = new Timeline();

let shard: Shard<TestSQLClient>;
let master: TestSQLClient;
let replica: TestSQLClient;

// Overcomplicated a little, but after a 2h struggle with TS & static methods
// typechecking, let it be like this for now.
class EncryptedValue {
  private constructor(private dbValue: string) {}

  static parse(dbValue: string) {
    return new this(dbValue);
  }

  static stringify(obj: EncryptedValue) {
    return obj.dbValue;
  }

  async decrypt(delta: number) {
    return this.dbValue
      .replace("encrypted:", "")
      .split("")
      .map((c) => String.fromCharCode(c.charCodeAt(0) - delta))
      .join("");
  }

  static async encrypt(text: string, delta: number) {
    return new this(
      "encrypted:" +
        text
          .split("")
          .map((c) => String.fromCharCode(c.charCodeAt(0) + delta))
          .join("")
    );
  }
}

async function shardRun<TOutput>(
  query: Query<TOutput>,
  freshness: typeof STALE_REPLICA | null = null
) {
  return shard.run(
    query,
    {
      trace: "some-trace",
      debugStack: "",
      vc: "some-vc",
      whyClient: undefined,
    },
    timeline,
    freshness
  );
}

beforeEach(async () => {
  timeline.reset();
  shard = testCluster.randomShard();
  master = await shard.client(MASTER);
  replica = await shard.client(timeline);

  await master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE);
  await master.rows(
    "DROP TABLE IF EXISTS %T CASCADE",
    TABLE_NULLABLE_UNIQUE_KEY
  );
  await master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_2COL);
  await master.rows(
    "DROP TABLE IF EXISTS %T CASCADE",
    TABLE_2COL_NULLABLE_UNIQUE_KEY
  );
  await master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_DATE);
  await master.rows(
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      name text NOT NULL,
      url_name text,
      some_flag boolean,
      json_text_field text,
      json_strongly_typed_field text,
      jsonb_field jsonb,
      encrypted_field text,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL,
      parent_id bigint,
      UNIQUE (name)
    )`,
    TABLE
  );
  await master.rows(
    `ALTER TABLE %T ADD CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) REFERENCES %T(id)`,
    TABLE,
    TABLE
  );
  await master.rows(
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      name text,
      url_name text,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL,
      UNIQUE (url_name)
    )`,
    TABLE_NULLABLE_UNIQUE_KEY
  );
  await master.rows(
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      name text NOT NULL,
      url_name text NOT NULL,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL,
      UNIQUE (name, url_name)
    )`,
    TABLE_2COL
  );
  await master.rows(
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      name text,
      url_name text,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL,
      UNIQUE (name, url_name)
    )`,
    TABLE_2COL_NULLABLE_UNIQUE_KEY
  );
  await master.rows(
    `CREATE TABLE %T(
      date_id bigint NOT NULL PRIMARY KEY,
      name text, 
      some_date timestamptz
    )`,
    TABLE_DATE
  );
  master.resetSnapshot();
  replica.resetSnapshot();
  timeline.reset();
});

const schema = new SQLSchema(
  TABLE,
  {
    name: { type: String },
    url_name: { type: String, allowNull: true },
    some_flag: { type: Boolean, allowNull: true, autoInsert: "false" },
    json_text_field: {
      // "JSON in a text field": we can just use built-in JSON class if we don't
      // care about having `any` as a value type.
      type: JSON,
      allowNull: true,
      autoInsert: "NULL",
    },
    json_strongly_typed_field: {
      // An illustration on how to use typescript-is.
      type: {
        parse: (v: string) => JSON.parse(v) as { a: number },
        stringify: (v: any) => JSON.stringify(v),
      },
      allowNull: true,
      autoInsert: "NULL",
    },
    jsonb_field: {
      // Node pg natively understands json/jsonb PG types and can
      // escape/unescape them. The problem is that we don't use the library's
      // facilities for escaping data (we do escaping by ourselves for various
      // reasons, like batching queries and better logging). So we can trust the
      // library on the `parse` path, but have to manually serialize on
      // `stringify` path.
      type: {
        parse: (v: any) => v, // node-postgres does conversion from JSON internally
        stringify: JSON.stringify,
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
  ["name"]
);

const schemaNullableUniqueKey = new SQLSchema(
  TABLE_NULLABLE_UNIQUE_KEY,
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String, allowNull: true },
    url_name: { type: String, allowNull: true },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
  },
  ["url_name"]
);

const schema2Col = new SQLSchema(
  TABLE_2COL,
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
    url_name: { type: String },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
  },
  ["name", "url_name"]
);

const schema2ColNullableUniqueKey = new SQLSchema(
  TABLE_2COL_NULLABLE_UNIQUE_KEY,
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String, allowNull: true },
    url_name: { type: String, allowNull: true },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
  },
  ["name", "url_name"]
);

const schemaDate = new SQLSchema(
  TABLE_DATE,
  {
    date_id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
    some_date: { type: Date, allowNull: true, autoInsert: "NULL" },
  },
  ["date_id"]
);

test("id_gen_single", async () => {
  master.resetSnapshot();
  const id1 = await shardRun(schema.idGen());
  const id2 = await shardRun(schema.idGen());
  master.toMatchSnapshot();
  expect(id1).not.toEqual(id2);
});

test("id_gen_batched", async () => {
  master.resetSnapshot();
  const [id1, id2] = await join([
    shardRun(schema.idGen()),
    shardRun(schema.idGen()),
  ]);
  master.toMatchSnapshot();
  expect(id1).not.toEqual(id2);
});

test("insert_single", async () => {
  const id1Gen = await shardRun(schema.idGen());
  const id1 = await shardRun(
    schema.insert({
      name: "a'b\x00'c",
      url_name: "aaa",
      some_flag: true,
      json_text_field: { a: 10, b: { c: 20 } },
      json_strongly_typed_field: { a: 42 },
      jsonb_field: { a: 42 },
      encrypted_field: await EncryptedValue.encrypt("text", 1),
      id: id1Gen,
    })
  );
  const id2 = await shardRun(
    schema.insert({ name: "a'b'c", url_name: "aaa_dup" })
  );
  master.toMatchSnapshot();

  expect(id1).toEqual(id1Gen);
  const row = await shardRun(schema.load(id1!));
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

test("insert_pre_generated_id_uniq_key_violation", async () => {
  const id1 = await shardRun(schema.idGen());
  const id2 = await shardRun(schema.idGen());
  const [res1, res2] = await join([
    shardRun(schema.insert({ id: id1, name: "some", url_name: "aaa" })),
    shardRun(schema.insert({ id: id2, name: "some", url_name: "aaa" })),
  ]);
  master.toMatchSnapshot();
  expect(res1 === null || res2 === null).toBeTruthy();
});

test("insert_batched", async () => {
  const id2Gen = await shardRun(schema.idGen());
  const [id1, id2, id3] = await join([
    shardRun(
      schema.insert({
        name: "z'b'c",
        url_name: null,
        some_flag: true,
        jsonb_field: null,
      })
    ),
    shardRun(
      schema.insert({ name: "a", url_name: "u", some_flag: null, id: id2Gen })
    ),
    shardRun(schema.insert({ name: "a", url_name: "u_dup" })),
  ]);
  master.toMatchSnapshot();

  const rows = await join([
    shardRun(schema.load(id1!)),
    shardRun(schema.load(id2!)),
  ]);
  expect(rows).toMatchObject([
    { name: "z'b'c", some_flag: true, jsonb_field: null },
    { name: "a", url_name: "u", some_flag: null, id: id2Gen },
  ]);

  expect(id3).toBeNull();
});

test("insert_is_never_dedupped", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "aaa", url_name: "uuu", some_flag: null })),
    shardRun(schema.insert({ name: "aaa", url_name: "uuu", some_flag: null })),
  ]);
  master.toMatchSnapshot();
  expect((id1 === null) !== (id2 === null)).toBeTruthy();
});

test("insert_pg_error_debatch", async () => {
  const [res1, res2] = await join([
    shardRun(
      // should succeed
      schema.insert({ name: "some", url_name: null })
    ).catch((e) => e),
    shardRun(
      // should fail with FK constraint error
      schema.insert({ name: "other", url_name: null, parent_id: "0" })
    ).catch((e) => e),
  ]);
  master.toMatchSnapshot();
  expect(typeof res1).toEqual("string");
  expect(res2).toBeInstanceOf(SQLError);
  expect(res2.isFKError()).toBeTruthy();
  expect(res2.isFKError("fk_parent_id")).toBeTruthy();
});

test("upsert_single", async () => {
  const id1 = await shardRun(schema.upsert({ name: "a'b'c", url_name: "aaa" }));
  const origRow1 = await master.rows(
    "SELECT created_at FROM %T WHERE id=?",
    ...[TABLE, id1]
  );
  await delay(20); // to check that created_at is constant

  const id2 = await shardRun(
    schema.upsert({ name: "a'b'c", url_name: "aaa_dup" })
  );
  const id3 = await shardRun(schema.upsert({ name: "zzz", url_name: "n" }));
  master.toMatchSnapshot();

  expect(id2).toEqual(id1);
  const rows = await master.rows(
    "SELECT id, name, created_at FROM %T ORDER BY NAME",
    ...[TABLE, id1]
  );
  expect(rows).toMatchObject([
    { id: id1, name: "a'b'c", created_at: origRow1[0].created_at },
    { id: id3, name: "zzz" },
  ]);
});

test("upsert_batched_normal", async () => {
  const [id1, id2, id3] = await join([
    shardRun(schema.upsert({ name: "a'b'c", url_name: "aaa" })),
    shardRun(schema.upsert({ name: "bbb", url_name: "bbb" })),
    shardRun(schema.upsert({ name: "ccc", url_name: "ccc" })),
  ]);
  master.resetSnapshot();

  const [r1, r2, r4, r4dup] = await join([
    shardRun(schema.upsert({ name: "a'b'c", url_name: "aaa_new" })),
    shardRun(schema.upsert({ name: "bbb", url_name: "bbb_new" })),
    shardRun(schema.upsert({ name: "zzz", url_name: "zzz" })),
    shardRun(schema.upsert({ name: "zzz", url_name: "zzz_dup" })),
  ]);
  master.toMatchSnapshot();

  expect(r1).toEqual(id1);
  expect(r2).toEqual(id2);
  expect(r4dup).toEqual(r4);

  const rows = await master.rows(
    "SELECT id, name, url_name FROM %T ORDER BY name",
    TABLE
  );
  expect(rows).toMatchObject([
    { id: id1, url_name: "aaa_new" },
    { id: id2, url_name: "bbb_new" },
    { id: id3, url_name: "ccc" },
    { id: r4, name: "zzz", url_name: "zzz_dup" },
  ]);
});

test("upsert_batched_with_nullable_unique_key", async () => {
  const [id0] = await join([
    shardRun(schemaNullableUniqueKey.upsert({ name: "000", url_name: "0" })),
  ]);
  const [id1, id2, id3] = await join([
    shardRun(schemaNullableUniqueKey.upsert({ name: "a'b'c", url_name: null })),
    shardRun(schemaNullableUniqueKey.upsert({ name: "bbb", url_name: null })),
    shardRun(schemaNullableUniqueKey.upsert({ name: "ccc", url_name: null })),
  ]);
  master.toMatchSnapshot();

  expect(id0 === id1).toBeFalsy();
  expect(id1 === id2).toBeFalsy();
  expect(id2 === id3).toBeFalsy();

  const rows = await master.rows(
    "SELECT id, name, url_name FROM %T ORDER BY name",
    TABLE_NULLABLE_UNIQUE_KEY
  );
  expect(rows).toMatchObject([
    { id: id0, name: "000", url_name: "0" },
    { id: id1, name: "a'b'c", url_name: null },
    { id: id2, name: "bbb", url_name: null },
    { id: id3, name: "ccc", url_name: null },
  ]);
});

test("update_single", async () => {
  const [id1, id2, id3] = await join([
    shardRun(schema.insert({ name: "a'url", url_name: "a" })),
    shardRun(schema.insert({ name: "b'url", url_name: "b" })),
    shardRun(schema.insert({ name: "null'url", url_name: null })),
  ]);

  const origRows = await join([
    shardRun(schema.load(id1!)),
    shardRun(schema.load(id2!)),
    shardRun(schema.load(id3!)),
  ]);
  await delay(20); // to check updated_at change

  master.resetSnapshot();
  await shardRun(schema.update(nullthrows(id1), {})); // no DB query is sent here
  const [r1, r2, r3] = await join([
    shardRun(schema.update(nullthrows(id1), { name: "a'upd" })),
    shardRun(
      schema.update(nullthrows(id2), {
        name: "b'upd",
        url_name: null,
        some_flag: true,
      })
    ),
    shardRun(schema.update(nullthrows(id3), { url_name: "n" })),
  ]);
  const r4 = await shardRun(schema.update("42", { name: "absent" }));
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeTruthy();
  expect(r3).toBeTruthy();
  expect(r4).toBeFalsy();

  const rows = await join([
    shardRun(schema.load(id1!)),
    shardRun(schema.load(id2!)),
    shardRun(schema.load(id3!)),
  ]);
  expect(rows).toMatchObject([
    { id: id1, name: "a'upd", url_name: "a" },
    { id: id2, name: "b'upd", url_name: null, some_flag: true },
    { id: id3, name: "null'url", url_name: "n" },
  ]);
  expect(rows[2]!.updated_at.getTime()).toBeGreaterThan(
    origRows[2]!.updated_at.getTime()
  );
});

test("update_skips_if_no_known_fields_present", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a'url", url_name: "a" })),
    shardRun(schema.insert({ name: "b'url", url_name: "b" })),
  ]);
  master.resetSnapshot();

  const unrelatedFields = {
    unrelated: 123,
    [Symbol("symbol")]: 42,
  } as any;
  const [r1, r2, r3] = await join([
    shardRun(schema.update(nullthrows(id1), unrelatedFields)),
    shardRun(schema.update(nullthrows(id2), unrelatedFields)),
    shardRun(schema.update("101", unrelatedFields)),
  ]);
  const r4 = await shardRun(schema.update(nullthrows(id1), unrelatedFields));
  const r5 = await shardRun(schema.update("42", { name: "absent" }));

  master.toMatchSnapshot(); // only r5 update will actually be sent to the DB
  expect(r1).toBeTruthy();
  expect(r2).toBeTruthy();
  expect(r3).toBeTruthy(); // although there is no such row, we still return true since the DB query is skipped
  expect(r4).toBeTruthy();
  expect(r5).not.toBeTruthy();
});

test("update_batched", async () => {
  const [id1, id2, id3] = await join([
    shardRun(schema.insert({ name: "a'url", url_name: "a" })),
    shardRun(schema.insert({ name: "b'url", url_name: "b" })),
    shardRun(schema.insert({ name: "null'url", url_name: null })),
  ]);
  master.resetSnapshot();

  await join([
    shardRun(schema.update(nullthrows(id1), {})),
    shardRun(schema.update(nullthrows(id2), {})),
  ]);
  const [r1, r2, r3, r3dup, r4] = await join([
    shardRun(
      schema.update(nullthrows(id1), { name: "a'upd", some_flag: true })
    ),
    shardRun(
      schema.update(nullthrows(id2), {
        name: "b'upd",
        url_name: null,
      })
    ),
    shardRun(
      schema.update(nullthrows(id3), {
        name: "null'upd",
        url_name: "n",
      })
    ),
    shardRun(
      schema.update(nullthrows(id3), {
        name: "null'upd",
        url_name: "n1",
      })
    ),
    shardRun(schema.update("42", { name: "absent", some_flag: true })),
  ]);
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeTruthy();
  expect(r3).toBeTruthy();
  expect(r3dup).toBeTruthy();
  expect(r4).toBeFalsy();

  const rows = await join([
    shardRun(schema.load(id1!)),
    shardRun(schema.load(id2!)),
    shardRun(schema.load(id3!)),
  ]);
  expect(rows).toMatchObject([
    { id: id1, name: "a'upd", url_name: "a", some_flag: true },
    { id: id2, name: "b'upd", url_name: null },
    { id: id3, name: "null'upd", url_name: "n1" },
  ]);
});

test("update_date", async () => {
  const [id1, id2] = await join([
    shardRun(schemaDate.insert({ name: "a", some_date: new Date(1234567890) })),
    shardRun(schemaDate.insert({ name: "b" })),
  ]);
  master.resetSnapshot();

  await shardRun(schemaDate.update(id1!, { some_date: undefined }));
  await shardRun(schemaDate.update(id2!, { name: "bb", some_date: undefined }));
  await join([
    shardRun(schemaDate.update(id1!, { some_date: undefined })),
    shardRun(schemaDate.update(id2!, { some_date: undefined })),
  ]);
  master.toMatchSnapshot();

  const [row1, row2] = await join([
    shardRun(schemaDate.load(id1!)),
    shardRun(schemaDate.load(id2!)),
  ]);
  expect(row1!.some_date).toBeTruthy();
  expect(row2!.name).toEqual("bb");
});

test("update_literal", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a", url_name: "a" })),
    shardRun(schema.insert({ name: "b", url_name: "b" })),
  ]);
  master.resetSnapshot();

  await join([
    shardRun(schema.update(id1!, { $literal: ["name = name || ?", 42] })),
    shardRun(schema.update(id2!, { name: "bbb" })),
    shardRun(schema.update(id1!, { $literal: ["name = name || ?", 42] })),
    shardRun(schemaDate.update("42", { $literal: ["name = name || ?", 42] })),
  ]);
  master.toMatchSnapshot();

  const [row1, row2] = await join([
    shardRun(schema.load(id1!)),
    shardRun(schema.load(id2!)),
  ]);
  expect(row1!.name).toEqual("a4242");
  expect(row2!.name).toEqual("bbb");
});

test("delete_single", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a", url_name: "a" })),
    shardRun(schema.insert({ name: "b", url_name: "b" })),
  ]);
  master.resetSnapshot();

  const r1 = await shardRun(schema.delete(nullthrows(id1)));
  const r2 = await shardRun(schema.delete("42"));
  const r3 = await shardRun(schema.delete(null as unknown as string));
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeFalsy();
  expect(r3).toBeFalsy();

  const rows = await join([
    shardRun(schema.load(id1!)),
    shardRun(schema.load(id2!)),
  ]);
  expect(rows).toMatchObject([null, { id: id2 }]);
});

test("delete_batched", async () => {
  const [id1, id2, id3] = await join([
    shardRun(schema.insert({ name: "a", url_name: "a" })),
    shardRun(schema.insert({ name: "b", url_name: "b" })),
    shardRun(schema.insert({ name: "n", url_name: null })),
  ]);
  master.resetSnapshot();

  const [r1, r2, r3] = await join([
    shardRun(schema.delete(nullthrows(id1))),
    shardRun(schema.delete(nullthrows(id2))),
    shardRun(schema.delete("42")),
    shardRun(schema.delete(null as unknown as string)),
  ]);
  master.toMatchSnapshot();

  expect(r1).toBeTruthy();
  expect(r2).toBeTruthy();
  expect(r3).toBeFalsy();

  const rows = await join([
    shardRun(schema.load(id1!)),
    shardRun(schema.load(id2!)),
    shardRun(schema.load(id3!)),
  ]);
  expect(rows).toMatchObject([null, null, { id: id3 }]);
});

test("delete_where", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a", url_name: "a" })),
    shardRun(schema.insert({ name: "b", url_name: "b" })),
  ]);
  master.resetSnapshot();

  const res = await shardRun(
    new SQLQueryDeleteWhere(schema, { id: [id1!, id2!], $literal: ["1=1"] })
  );
  master.toMatchSnapshot();
  expect(res.length).toEqual(2);

  const rows = await join([
    shardRun(schema.load(id1!)),
    shardRun(schema.load(id2!)),
  ]);
  expect(rows).toEqual([null, null]);
});

test("load_batched", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a", url_name: "a" })),
    shardRun(schema.insert({ name: "b", url_name: "b" })),
  ]);

  master.resetSnapshot();
  const rows = await join([
    shardRun(schema.load(id1!)),
    shardRun(schema.load(id2!)),
    shardRun(schema.load(id1!)),
  ]);
  master.toMatchSnapshot();
  expect(rows).toMatchObject([{ id: id1 }, { id: id2 }, { id: id1 }]);
});

test("loadby_single_one_column", async () => {
  const [, id2] = await join([
    shardRun(schema.insert({ name: "a", url_name: "aaa" })),
    shardRun(schema.insert({ name: "b", url_name: "bbb" })),
  ]);

  const row = await shardRun(schema.loadBy({ name: "b" }), STALE_REPLICA);
  replica.toMatchSnapshot();
  expect(row).toMatchObject({ id: id2, name: "b" });
});

test("loadby_batched_one_column", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a", url_name: "aaa" })),
    shardRun(schema.insert({ name: "b", url_name: "bbb" })),
  ]);

  master.resetSnapshot();
  const rows = await join([
    shardRun(schema.loadBy({ name: "a" })),
    shardRun(schema.loadBy({ name: "b" })),
    shardRun(schema.loadBy({ name: "no" })),
    shardRun(schema.loadBy({ name: "a" })),
  ]);
  master.toMatchSnapshot();
  expect(rows).toMatchObject([{ id: id1 }, { id: id2 }, null, { id: id1 }]);
});

test("loadby_single_two_columns", async () => {
  const [, id2] = await join([
    shardRun(schema2Col.insert({ name: "a", url_name: "aaa" })),
    shardRun(schema2Col.insert({ name: "b", url_name: "bbb" })),
  ]);

  master.resetSnapshot();
  const row = await shardRun(schema2Col.loadBy({ name: "b", url_name: "bbb" }));
  master.toMatchSnapshot();
  expect(row).toMatchObject({ id: id2, name: "b" });
});

test("loadby_batched_two_columns", async () => {
  const [id1, id2, id3, id4, id5] = await join([
    shardRun(schema2Col.insert({ name: "z", url_name: "z1" })),
    shardRun(schema2Col.insert({ name: "z", url_name: "z2" })),
    shardRun(schema2Col.insert({ name: "b", url_name: "b1" })),
    shardRun(schema2Col.insert({ name: "c", url_name: "c1" })),
    shardRun(schema2Col.insert({ name: "c", url_name: "c2" })),
  ]);

  master.resetSnapshot();
  const rows = await join([
    shardRun(schema2Col.loadBy({ name: "z", url_name: "z1" })),
    shardRun(schema2Col.loadBy({ name: "z", url_name: "z2" })),
    shardRun(schema2Col.loadBy({ name: "no", url_name: "no" })),
    shardRun(schema2Col.loadBy({ name: "b", url_name: "b1" })),
    shardRun(schema2Col.loadBy({ name: "c", url_name: "c1" })),
    shardRun(schema2Col.loadBy({ name: "c", url_name: "c2" })),
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

test("loadby_single_two_columns_nullable_unique_key", async () => {
  const [, id2] = await join([
    shardRun(
      schema2ColNullableUniqueKey.insert({ name: "a", url_name: "aaa" })
    ),
    shardRun(schema2ColNullableUniqueKey.insert({ name: "b", url_name: null })),
  ]);

  master.resetSnapshot();
  const row = await shardRun(
    schema2ColNullableUniqueKey.loadBy({ name: "b", url_name: null })
  );
  await shardRun(
    schema2ColNullableUniqueKey.loadBy({ name: null, url_name: "a" })
  );
  await shardRun(
    schema2ColNullableUniqueKey.loadBy({ name: null, url_name: null })
  );
  master.toMatchSnapshot();
  expect(row).toMatchObject({ id: id2, name: "b" });
});

test("loadby_batched_two_columns_nullable_unique_key", async () => {
  const [id1, id2, id3, id4, id5] = await join([
    shardRun(schema2ColNullableUniqueKey.insert({ name: "z", url_name: "z1" })),
    shardRun(schema2ColNullableUniqueKey.insert({ name: "z", url_name: "z2" })),
    shardRun(schema2ColNullableUniqueKey.insert({ name: "b", url_name: null })),
    shardRun(schema2ColNullableUniqueKey.insert({ name: "c", url_name: null })),
    shardRun(schema2ColNullableUniqueKey.insert({ name: "c", url_name: "c2" })),
  ]);

  master.resetSnapshot();
  const rows = await join([
    shardRun(schema2ColNullableUniqueKey.loadBy({ name: "z", url_name: "z1" })),
    shardRun(schema2ColNullableUniqueKey.loadBy({ name: "z", url_name: "z2" })),
    shardRun(
      schema2ColNullableUniqueKey.loadBy({ name: "no", url_name: "no" })
    ),
    shardRun(schema2ColNullableUniqueKey.loadBy({ name: "b", url_name: null })),
    shardRun(schema2ColNullableUniqueKey.loadBy({ name: "c", url_name: null })),
    shardRun(schema2ColNullableUniqueKey.loadBy({ name: "c", url_name: "c2" })),
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

test("select_and_count_batched", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a", url_name: "a1", some_flag: true })),
    shardRun(schema.insert({ name: "aa", url_name: "aa1", some_flag: true })),
    shardRun(schema.insert({ name: "c", url_name: "c1" })),
    shardRun(schema.insert({ name: "d", url_name: "d1" })),
    shardRun(schema.insert({ name: "e", url_name: "ce1" })),
  ]);
  master.resetSnapshot();

  const input: Parameters<typeof schema.select>[0] = {
    order: [{ name: "ASC" }, { url_name: "DESC" }, { $literal: ["1=?", 2] }],
    where: {
      name: ["a", "aa"],
      some_flag: true,
      $or: [
        { name: "a" },
        { name: "aa" },
        { url_name: [] },
        { url_name: [null, "zzz"] },
      ],
      $and: [
        { name: ["a", "aa"] },
        { name: { $ne: "kk" } },
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
    shardRun(schema.select(input)),
    shardRun(schema.select({ where: { name: "b" }, limit: 10 })),
  ]);
  const [count1, count2, count3, count4] = await join([
    shardRun(schema.count(input.where!)),
    shardRun(schema.count(input.where!)),
    shardRun(schema.count({ ...input.where!, url_name: "a1" })),
    shardRun(schema.count({ name: "b" })),
  ]);
  const count5 = await shardRun(schema.count(input.where!));

  master.toMatchSnapshot();
  expect(rows1).toMatchObject([{ id: id1 }, { id: id2 }]);
  expect(count1).toEqual(2);
  expect(count2).toEqual(2);
  expect(count3).toEqual(1);
  expect(count4).toEqual(0);
  expect(count5).toEqual(2);
});

test("select_custom", async () => {
  const [id1, id2] = await join([
    shardRun(schema.insert({ name: "a", url_name: "a1" })),
    shardRun(schema.insert({ name: "b", url_name: "b1" })),
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
    },
  };

  const [rows1] = await join([shardRun(schema.select(input))]);
  expect(rows1).toMatchObject([{ id: id1 }]);

  const [rows1a, rows2] = await join([
    shardRun(schema.select(input)),
    shardRun(schema.select({ where: { name: "b" }, limit: 10 })),
  ]);
  expect(rows1a).toMatchObject([{ id: id1 }]);
  expect(rows2).toMatchObject([{ id: id2 }]);

  master.toMatchSnapshot();
});

test("test_empty_$or_and_$and", async () => {
  await join([
    shardRun(schema.insert({ name: "a", url_name: "a1", some_flag: true })),
    shardRun(schema.insert({ name: "aa", url_name: "aa1", some_flag: true })),
  ]);

  const [all, emptyOR, emptyAND] = await join([
    shardRun(schema.select({ where: {}, limit: 2 })),
    shardRun(schema.select({ where: { $or: [] }, limit: 2 })),
    shardRun(schema.select({ where: { $and: [] }, limit: 2 })),
  ]);
  expect(all.length).toBe(2);
  expect(emptyOR.length).toBe(0);
  expect(emptyAND.length).toBe(0);
});
