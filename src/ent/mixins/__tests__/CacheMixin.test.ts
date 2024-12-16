import { MASTER } from "../../../abstract/Shard";
import type { TestPgClient } from "../../../pg/__tests__/test-utils";
import {
  recreateTestTables,
  testCluster,
} from "../../../pg/__tests__/test-utils";
import { escapeIdent } from "../../../pg/helpers/escapeIdent";
import { PgSchema } from "../../../pg/PgSchema";
import { createVC } from "../../__tests__/test-utils";
import { BaseEnt } from "../../BaseEnt";
import { True } from "../../predicates/True";
import { AllowIf } from "../../rules/AllowIf";
import { Require } from "../../rules/Require";
import { GLOBAL_SHARD } from "../../ShardAffinity";
import type { VC } from "../../VC";
import { VCWithQueryCache } from "../../VCFlavor";

class EntTest extends BaseEnt(
  testCluster,
  new PgSchema(
    'cache-mixin"test',
    {
      id: { type: String, autoInsert: "id_gen()" },
      k1: { type: String },
      k2: { type: String },
    },
    ["k1", "k2"],
  ),
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      k1 text NOT NULL,
      k2 text NOT NULL,
      UNIQUE (k1, k2)
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyInferPrincipal: null,
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new Require(new True())],
    });
  }
}

const STATIC_ID = "42";
const ROW = { k1: "test", k2: "test" };

let vc: VC;
let master: TestPgClient;

beforeEach(async () => {
  await recreateTestTables([EntTest]);
  vc = createVC().withFlavor(new VCWithQueryCache({ maxQueries: 1000 }));
  master = await EntTest.CLUSTER.globalShard().client(MASTER);
});

test.each([
  [
    "cache is cleaned on insert with id",
    async (vc: VC) => EntTest.insert(vc, { id: STATIC_ID, ...ROW }),
  ],
  [
    "cache is cleaned on upsert with id",
    async (vc: VC) => EntTest.upsert(vc, { id: STATIC_ID, ...ROW }),
  ],
  [
    "cache is cleaned on insert without id",
    async (vc: VC) => EntTest.insert(vc, ROW),
  ],
  [
    "cache is cleaned on upsert without id",
    async (vc: VC) => EntTest.upsert(vc, ROW),
  ],
  [
    "cache is cleaned on update",
    async (_vc: VC, existing: EntTest) =>
      existing.updateOriginal(ROW).then(() => existing.id),
  ],
])("%s", async (_name, mutate) => {
  const existing = await EntTest.insertReturning(vc, {
    ...ROW,
    k1: "test-existing",
  });

  // Prewarm cache.
  expect(await EntTest.loadNullable(vc, STATIC_ID)).toEqual(null);
  expect(await EntTest.loadNullable(vc, existing.id)).not.toMatchObject(ROW);
  expect(await EntTest.loadByNullable(vc, ROW)).toEqual(null);
  expect(await EntTest.selectBy(vc, { k1: ROW.k1 })).toHaveLength(0);
  expect(await EntTest.select(vc, ROW, 1)).toHaveLength(0);
  expect(await EntTest.count(vc, ROW)).toEqual(0);
  expect(await EntTest.exists(vc, ROW)).toEqual(false);

  const mutatedID = await mutate(vc, existing);

  // Mutation should be reflected in all read calls.
  expect(await EntTest.loadNullable(vc, mutatedID)).toMatchObject(ROW);
  expect(await EntTest.loadByNullable(vc, ROW)).toMatchObject(ROW);
  expect(await EntTest.selectBy(vc, { k1: ROW.k1 })).toHaveLength(1);
  expect(await EntTest.select(vc, ROW, 1)).toHaveLength(1);
  expect(await EntTest.count(vc, ROW)).toEqual(1);
  expect(await EntTest.exists(vc, ROW)).toEqual(true);

  // Direct DB modification must not affect cache.
  await master.query({
    query: [
      `DELETE FROM ${escapeIdent(EntTest.SCHEMA.name)} WHERE id=?`,
      mutatedID,
    ],
    isWrite: true,
    annotations: [],
    op: "",
    table: EntTest.SCHEMA.name,
    batchFactor: 1,
  });

  expect(await EntTest.loadNullable(vc, mutatedID)).toMatchObject(ROW);
  expect(await EntTest.loadByNullable(vc, ROW)).toMatchObject(ROW);
  expect(await EntTest.select(vc, ROW, 1)).toHaveLength(1);
  expect(await EntTest.count(vc, ROW)).toEqual(1);
  expect(await EntTest.exists(vc, ROW)).toEqual(true);
});

test("cache is cleaned on delete", async () => {
  const existing = await EntTest.insertReturning(vc, ROW);

  // Prewarm cache.
  expect(await EntTest.loadNullable(vc, existing.id)).toMatchObject(ROW);
  expect(await EntTest.loadByNullable(vc, ROW)).toMatchObject(ROW);
  expect(await EntTest.selectBy(vc, { k1: ROW.k1 })).toHaveLength(1);
  expect(await EntTest.select(vc, ROW, 1)).toHaveLength(1);
  expect(await EntTest.count(vc, ROW)).toEqual(1);
  expect(await EntTest.exists(vc, ROW)).toEqual(true);

  await existing.deleteOriginal();

  // Deletion must be reflected in all read calls.
  expect(await EntTest.loadNullable(vc, existing.id)).toEqual(null);
  expect(await EntTest.loadByNullable(vc, ROW)).toEqual(null);
  expect(await EntTest.selectBy(vc, { k1: ROW.k1 })).toHaveLength(0);
  expect(await EntTest.select(vc, ROW, 1)).toHaveLength(0);
  expect(await EntTest.count(vc, ROW)).toEqual(0);
  expect(await EntTest.exists(vc, ROW)).toEqual(false);
});
