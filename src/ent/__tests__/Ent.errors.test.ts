import { join, nullthrows } from "../../internal/misc";
import { recreateTestTables, testCluster } from "../../pg/__tests__/test-utils";
import { PgSchema } from "../../pg/PgSchema";
import { ID } from "../../types";
import { BaseEnt } from "../BaseEnt";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import { GLOBAL_SHARD } from "../ShardAffinity";
import { createVC } from "./test-utils";

const vc = createVC();

class EntTestNoUniqueIndex extends BaseEnt(
  testCluster,
  new PgSchema(
    'ent.errors"no_unique_index',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      name: { type: String },
    },
    ["name"],
  ),
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL,
      name text NOT NULL
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

beforeEach(async () => {
  await recreateTestTables([EntTestNoUniqueIndex]);
});

test('upsert() error does not duplicate "after 1 attempt" suffix in the stack', async () => {
  const error = nullthrows(
    await join([
      join([
        EntTestNoUniqueIndex.upsert(vc, { name: "name1" }),
        EntTestNoUniqueIndex.upsert(vc, { name: "name2" }),
        EntTestNoUniqueIndex.upsert(vc, { name: "name3" }),
      ]),
      EntTestNoUniqueIndex.upsert(vc, { name: "name4" }),
      EntTestNoUniqueIndex.upsert(vc, { name: "name5" }),
      join([
        EntTestNoUniqueIndex.upsert(vc, { name: "name6" }),
        EntTestNoUniqueIndex.upsert(vc, { name: "name7" }),
        EntTestNoUniqueIndex.upsert(vc, { name: "name8" }),
      ]),
    ])
      .then(() => null)
      .catch((e: unknown) => e),
  );

  const stackTraceLines = (error as Error).stack?.split("\n");
  expect(
    stackTraceLines?.filter((line) => line.includes("Cause:")).length,
  ).toBe(3);
  expect(
    stackTraceLines?.filter((line) =>
      line.includes("at async Promise.all (index *)"),
    ).length,
  ).toBe(3);
  expect((error as Error).stack).toMatch(
    /.*Ent.errors.test.ts.*\n\s+on test-pool.*\n\s+after 1 attempt$/s,
  );
});
