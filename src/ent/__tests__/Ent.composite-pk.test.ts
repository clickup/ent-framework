import { MASTER } from "../../abstract/Shard";
import { join } from "../../helpers";
import { SQLSchema } from "../../sql/SQLSchema";
import { testCluster } from "../../sql/__tests__/helpers/TestSQLClient";
import { ID } from "../../types";
import { BaseEnt } from "../BaseEnt";
import { GLOBAL_SHARD } from "../Configuration";
import { CanReadOutgoingEdge } from "../predicates/CanReadOutgoingEdge";
import { OutgoingEdgePointsToVC } from "../predicates/OutgoingEdgePointsToVC";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import { createVC } from "./helpers/test-objects";

const TABLE_USER = 'ent"user_composite';
const TABLE_COMPOSITE = 'ent"composite';

const schemaTestUser = new SQLSchema(
  TABLE_USER,
  {
    userid: { type: ID, autoInsert: "id_gen()" },
    name: { type: String },
  },
  ["userid"]
);

export class EntTestUser extends BaseEnt(testCluster, schemaTestUser) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyLoad: [new AllowIf(new OutgoingEdgePointsToVC("userid"))],
      privacyInsert: [],
      privacyUpdate: [new Require(new OutgoingEdgePointsToVC("userid"))],
    });
  }
}

const schemaTestComposite = new SQLSchema(
  TABLE_COMPOSITE,
  {
    user_id: { type: ID },
    some_id: { type: ID, autoInsert: "id_gen()" },
    name: { type: String },
  },
  ["user_id", "some_id"]
);

export class EntTestComposite extends BaseEnt(
  testCluster,
  schemaTestComposite
) {
  static TRIGGER_CALLS: Array<{
    type: string;
    old?: any;
    new?: any;
    input?: any;
  }> = [];

  static override configure() {
    return new this.Configuration({
      shardAffinity: ["some_id"],
      privacyLoad: [
        new AllowIf(new CanReadOutgoingEdge("user_id", EntTestUser)),
      ],
      privacyInsert: [new Require(new True())],
      /*beforeInsert: [
        async (_vc, { input }) => {
          this.TRIGGER_CALLS.push({
            type: "beforeInsert",
            input: { ...input },
          });
        },
      ],*/
    });
  }
}

let user: EntTestUser;

beforeEach(async () => {
  const globalMaster = await testCluster.globalShard().client(MASTER);
  const master = await testCluster.randomShard().client(MASTER);
  await join([
    globalMaster.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_USER),
    master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_COMPOSITE),
  ]);
  await join([
    globalMaster.rows(
      `CREATE TABLE %T(
        userid bigint NOT NULL PRIMARY KEY,
        name text
      )`,
      TABLE_USER
    ),
    master.rows(
      `CREATE TABLE %T(
        user_id bigint NOT NULL,
        some_id bigint NOT NULL,
        name text,
        UNIQUE(user_id, some_id)
      )`,
      TABLE_COMPOSITE
    ),
  ]);

  user = await EntTestUser.insertReturning(createVC().toOmniDangerous(), {
    name: "my-name",
  });
  expect(user).toMatchObject({
    id: user.vc.userID,
    userid: user.vc.userID,
  });
});

test("simple", async () => {
  const composite = await EntTestComposite.insertReturning(user.vc, {
    user_id: user.vc.userID,
    name: "my-name",
  });
  expect(composite).toMatchObject({
    id: `(${user.vc.userID},${composite.some_id})`,
    user_id: user.vc.userID,
  });
});