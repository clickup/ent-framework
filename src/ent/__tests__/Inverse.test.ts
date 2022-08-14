import sortBy from "lodash/sortBy";
import { MASTER } from "../../abstract/Shard";
import { join, mapJoin } from "../../helpers";
import { SQLSchema } from "../../sql/SQLSchema";
import { testCluster } from "../../sql/__tests__/helpers/TestSQLClient";
import { ID } from "../../types";
import { BaseEnt } from "../BaseEnt";
import { EntCannotDetectShardError } from "../errors/EntCannotDetectShardError";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { VC } from "../VC";
import { createVC } from "./helpers/test-objects";

const TABLE_USER = 'inv"test_user';
const TABLE_INVERSE = 'inv"test_inverse';

const schemaTestUser = new SQLSchema(TABLE_USER, {
  id: { type: ID, autoInsert: "id_gen()" },
  company_id: { type: ID, allowNull: true },
  team_id: { type: ID, allowNull: true },
  name: { type: String },
});

class EntTestUser extends BaseEnt(testCluster, schemaTestUser) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: [],
      inverses: {
        company_id: { name: TABLE_INVERSE, type: "company2user" },
        team_id: { name: TABLE_INVERSE, type: "team2user" },
      },
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new AllowIf(new True())],
    });
  }
}

async function init() {
  await mapJoin([...testCluster.shards.values()], async (shard) => {
    const client = await shard.client(MASTER);
    await join([
      client.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_USER),
      client.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_INVERSE),
    ]);
    await join([
      client.rows(
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          company_id BIGINT,
          team_id BIGINT,
          name text NOT NULL
        )`,
        TABLE_USER
      ),
      client.rows(
        `CREATE TABLE %T(
          id bigint NOT NULL PRIMARY KEY,
          id1 bigint,
          type varchar(32) NOT NULL,
          id2 bigint NOT NULL
        )`,
        TABLE_INVERSE
      ),
    ]);
  });
}

let vc: VC;

beforeEach(async () => {
  vc = createVC();
  try {
    await init();
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e);
    throw e;
  }
});

test("CRUD", async () => {
  const companyID = "1000000000000000010";
  const teamID = "1000100000000000020";

  let user = await EntTestUser.insertReturning(vc, {
    company_id: companyID,
    team_id: teamID,
    name: "u1",
  });

  expect(await EntTestUser.INVERSES[0].id2s(vc, companyID)).toEqual([user.id]);
  expect(await EntTestUser.INVERSES[1].id2s(vc, teamID)).toEqual([user.id]);

  const companyID2 = "1000100000000000012";
  const teamID2 = "1000000000000000022";

  user = await user.updateReturningX({
    company_id: companyID2,
    team_id: teamID2,
  });

  expect(await EntTestUser.INVERSES[0].id2s(vc, companyID)).toEqual([]);
  expect(await EntTestUser.INVERSES[1].id2s(vc, teamID)).toEqual([]);
  expect(await EntTestUser.INVERSES[0].id2s(vc, companyID2)).toEqual([user.id]);
  expect(await EntTestUser.INVERSES[1].id2s(vc, teamID2)).toEqual([user.id]);

  await user.deleteOriginal();

  expect(await EntTestUser.INVERSES[0].id2s(vc, companyID2)).toEqual([]);
  expect(await EntTestUser.INVERSES[1].id2s(vc, teamID2)).toEqual([]);
});

test("nullable fields", async () => {
  const user = await EntTestUser.insertReturning(vc, {
    company_id: null,
    team_id: null,
    name: "u2",
  });

  expect(await EntTestUser.INVERSES[0].id2s(vc, null)).toEqual([user.id]);
  expect(await EntTestUser.INVERSES[1].id2s(vc, null)).toEqual([user.id]);

  await user.deleteOriginal();

  expect(await EntTestUser.INVERSES[0].id2s(vc, null)).toEqual([]);
  expect(await EntTestUser.INVERSES[1].id2s(vc, null)).toEqual([]);
});

test("cross-shard select", async () => {
  const companyIDNull = null;
  const teamID = "1000100000000000020";

  const user = await EntTestUser.insertReturning(vc, {
    company_id: companyIDNull,
    team_id: teamID,
    name: "u1",
  });

  expect(
    await EntTestUser.select(vc, { company_id: companyIDNull }, 42)
  ).toMatchObject([{ id: user.id, name: "u1" }]);

  expect(await EntTestUser.select(vc, { team_id: teamID }, 42)).toMatchObject([
    { id: user.id, name: "u1" },
  ]);

  const companyID2 = "1000100000000000012";

  const user2 = await EntTestUser.insertReturning(vc, {
    company_id: companyID2,
    team_id: teamID,
    name: "u2",
  });

  const users = sortBy(
    await EntTestUser.select(vc, { team_id: teamID }, 42),
    (u) => u.name
  );
  expect(users).toMatchObject([
    { id: user.id, name: "u1" },
    { id: user2.id, name: "u2" },
  ]);
});

test("exception", async () => {
  await expect(EntTestUser.select(vc, { name: "u2" }, 42)).rejects.toThrow(
    EntCannotDetectShardError
  );
});
