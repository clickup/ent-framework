import sortBy from "lodash/sortBy";
import { MASTER } from "../../abstract/Shard";
import { join, mapJoin } from "../../helpers";
import { SQLSchema } from "../../sql/SQLSchema";
import { testCluster } from "../../sql/__tests__/helpers/TestSQLClient";
import { ID } from "../../types";
import { BaseEnt, GLOBAL_SHARD } from "../BaseEnt";
import { EntCannotDetectShardError } from "../errors/EntCannotDetectShardError";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { VC } from "../VC";
import { createVC } from "./helpers/test-objects";

const TABLE_USER = 'inv"test_user';
const TABLE_TOPIC = 'inv"test_topic';
const TABLE_COMPANY = 'inv"test_company';
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
        company_id: { name: TABLE_INVERSE, type: "company2users" },
        team_id: { name: TABLE_INVERSE, type: "team2user" },
      },
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new AllowIf(new True())],
    });
  }
}

const schemaTestCompany = new SQLSchema(
  TABLE_COMPANY,
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  ["name"]
);

class EntTestCompany extends BaseEnt(testCluster, schemaTestCompany) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new AllowIf(new True())],
    });
  }
}

const schemaTestTopic = new SQLSchema(
  TABLE_TOPIC,
  {
    id: { type: ID, autoInsert: "id_gen()" },
    owner_id: { type: ID }, // either EntTestUser (sharded) or EntTestCompany (global)
    slug: { type: String },
  },
  ["owner_id", "slug"]
);

class EntTestTopic extends BaseEnt(testCluster, schemaTestTopic) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: ["owner_id"],
      inverses: {
        owner_id: { name: TABLE_INVERSE, type: "owner2topics" },
      },
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new AllowIf(new True())],
    });
  }
}

async function init() {
  const globalMaster = await testCluster.globalShard().client(MASTER);
  await join([
    globalMaster.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_INVERSE),
    globalMaster.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_COMPANY),
  ]);
  await join([
    globalMaster.rows(
      `CREATE TABLE %T(
        id bigint NOT NULL PRIMARY KEY,
        name text NOT NULL
      )`,
      TABLE_COMPANY
    ),
    globalMaster.rows(
      `CREATE TABLE %T(
        id bigint NOT NULL PRIMARY KEY,
        id1 bigint,
        type varchar(32) NOT NULL,
        id2 bigint NOT NULL
      )`,
      TABLE_INVERSE
    ),
  ]);

  await mapJoin(
    [...testCluster.shards.values()].filter(
      (shard) => shard !== testCluster.globalShard()
    ),
    async (shard) => {
      const master = await shard.client(MASTER);
      await join([
        master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_INVERSE),
        master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_TOPIC),
        master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_USER),
      ]);
      await join([
        master.rows(
          `CREATE TABLE %T(
            id bigint NOT NULL PRIMARY KEY,
            company_id BIGINT,
            team_id BIGINT,
            name text NOT NULL
          )`,
          TABLE_USER
        ),
        master.rows(
          `CREATE TABLE %T(
            id bigint NOT NULL PRIMARY KEY,
            owner_id bigint NOT NULL,
            slug text NOT NULL
          )`,
          TABLE_TOPIC
        ),
        master.rows(
          `CREATE TABLE %T(
            id bigint NOT NULL PRIMARY KEY,
            id1 bigint,
            type varchar(32) NOT NULL,
            id2 bigint NOT NULL
          )`,
          TABLE_INVERSE
        ),
      ]);
    }
  );
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

test("optionally sharded colocation", async () => {
  const user = await EntTestUser.insertReturning(vc, {
    company_id: null,
    team_id: null,
    name: "u1",
  });
  const inverse = EntTestTopic.INVERSES[0];

  const company = await EntTestCompany.insertReturning(vc, {
    name: "c1",
  });

  const topic1 = await EntTestTopic.insertReturning(vc, {
    owner_id: user.id,
    slug: "topic1",
  });
  expect(await inverse.id2s(vc, user.id)).toEqual([]); // no inverse created since it's in shardAffinity
  expect(await EntTestTopic.select(vc, { owner_id: user.id }, 1)).toMatchObject(
    [{ id: topic1.id }]
  );
  expect(
    await EntTestTopic.loadByX(vc, { owner_id: user.id, slug: "topic1" })
  ).toMatchObject({ id: topic1.id });

  const topic2 = await EntTestTopic.insertReturning(vc, {
    owner_id: company.id,
    slug: "topic2",
  });
  expect(await inverse.id2s(vc, company.id)).toEqual([topic2.id]);
  expect(
    await EntTestTopic.select(vc, { owner_id: company.id }, 1)
  ).toMatchObject([{ id: topic2.id }]);
  expect(
    await EntTestTopic.loadByX(vc, { owner_id: company.id, slug: "topic2" })
  ).toMatchObject({ id: topic2.id });

  expect(
    await EntTestTopic.loadByNullable(vc, {
      owner_id: "1000000000000000000",
      slug: "topic2",
    })
  ).toBeNull();
});

test("exception", async () => {
  await expect(EntTestUser.select(vc, { name: "u2" }, 42)).rejects.toThrow(
    EntCannotDetectShardError
  );
});
