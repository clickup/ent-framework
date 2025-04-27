import { recreateTestTables, testCluster } from "../../pg/__tests__/test-utils";
import { PgSchema } from "../../pg/PgSchema";
import { ID, JSONType } from "../../types";
import { BaseEnt } from "../BaseEnt";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import { GLOBAL_SHARD } from "../ShardAffinity";
import { createVC } from "./test-utils";

const vc = createVC();

class EntTestIssue extends BaseEnt(
  testCluster,
  new PgSchema(
    'ent.custom-fields"issues',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      labels: { type: JSONType<string[]>() },
    },
    [],
  ),
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL,
      labels jsonb NOT NULL
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
  await recreateTestTables([EntTestIssue]);
});

test("JSONType", async () => {
  const issue = await EntTestIssue.insertReturning(vc, { labels: ["a"] });
  expect(issue.labels).toEqual(["a"]);
});
