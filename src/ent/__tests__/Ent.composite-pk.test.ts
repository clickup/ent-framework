import { recreateTestTables, testCluster } from "../../pg/__tests__/test-utils";
import { PgSchema } from "../../pg/PgSchema";
import { ID } from "../../types";
import { BaseEnt } from "../BaseEnt";
import { CanReadOutgoingEdge } from "../predicates/CanReadOutgoingEdge";
import { OutgoingEdgePointsToVC } from "../predicates/OutgoingEdgePointsToVC";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import { GLOBAL_SHARD } from "../ShardAffinity";
import { createVC } from "./test-utils";

class EntTestUser extends BaseEnt(
  testCluster,
  new PgSchema(
    'ent.composite-pk"test_user',
    {
      userid: { type: ID, autoInsert: "id_gen()" },
      name: { type: String },
    },
    ["userid"],
  ),
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      userid bigint NOT NULL PRIMARY KEY,
      name text
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyInferPrincipal: async (_vc, row) => row.userid,
      privacyLoad: [new AllowIf(new OutgoingEdgePointsToVC("userid"))],
      privacyInsert: [],
      privacyUpdate: [new Require(new OutgoingEdgePointsToVC("userid"))],
    });
  }
}

class EntTestComposite extends BaseEnt(
  testCluster,
  new PgSchema(
    'ent.composite-pk"test_composite',
    {
      user_id: { type: ID },
      some_id: { type: ID, autoInsert: "id_gen()" },
      name: { type: String },
    },
    ["user_id", "some_id"],
  ),
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      user_id bigint NOT NULL,
      some_id bigint NOT NULL,
      name text,
      UNIQUE(user_id, some_id)
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: ["some_id"],
      privacyInferPrincipal: async (_vc, row) => row.user_id,
      privacyLoad: [
        new AllowIf(new CanReadOutgoingEdge("user_id", EntTestUser)),
      ],
      privacyInsert: [new Require(new True())],
    });
  }
}

let user: EntTestUser;

beforeEach(async () => {
  await recreateTestTables([EntTestUser, EntTestComposite]);

  user = await EntTestUser.insertReturning(createVC().toOmniDangerous(), {
    name: "my-name",
  });
  expect(user).toMatchObject({
    id: user.vc.principal,
    userid: user.vc.principal,
  });
});

test("simple use case", async () => {
  const composite = await EntTestComposite.insertReturning(user.vc, {
    user_id: user.vc.principal,
    name: "my-name",
  });
  expect(composite).toMatchObject({
    id: `(${user.vc.principal},${composite.some_id})`,
    user_id: user.vc.principal,
  });

  const rows = await EntTestComposite.select(
    user.vc,
    { user_id: composite.user_id, some_id: composite.some_id },
    1,
  );
  expect(rows).toHaveLength(1);

  await EntTestComposite.loadByX(user.vc, {
    user_id: composite.user_id,
    some_id: composite.some_id,
  });

  await EntTestComposite.loadX(user.vc, composite.id);
});
