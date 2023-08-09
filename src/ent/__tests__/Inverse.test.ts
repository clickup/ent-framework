import delay from "delay";
import range from "lodash/range";
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";
import { collect } from "streaming-iterables";
import { MASTER } from "../../abstract/Shard";
import { ShardError } from "../../abstract/ShardError";
import { join, mapJoin } from "../../helpers/misc";
import {
  recreateTestTables,
  testCluster,
} from "../../sql/__tests__/test-utils";
import { SQLSchema } from "../../sql/SQLSchema";
import { ID } from "../../types";
import { BaseEnt, GLOBAL_SHARD } from "../BaseEnt";
import { EntCannotDetectShardError } from "../errors/EntCannotDetectShardError";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import type { VC } from "../VC";
import { createVC } from "./test-utils";

const TABLE_INVERSE = 'inverse"test_inverse';

/**
 * An Ent in GLOBAL_SHARD.
 */
class EntTestCompany extends BaseEnt(
  testCluster,
  new SQLSchema(
    'inverse"test_company',
    {
      id: { type: String, autoInsert: "id_gen()" },
      name: { type: String },
    },
    ["name"]
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      name text NOT NULL
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new Require(new True())],
    });
  }
}

/**
 * An Ent in a random shard with high-cardinality Inverses.
 */
class EntTestUser extends BaseEnt(
  testCluster,
  new SQLSchema(
    'inverse"test_user',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      company_id: { type: ID, allowNull: true },
      team_id: { type: ID, allowNull: true },
      name: { type: String },
    },
    ["company_id", "team_id"]
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      company_id bigint,
      team_id bigint,
      name text NOT NULL
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: [],
      inverses: {
        company_id: { name: TABLE_INVERSE, type: "company2users" },
        team_id: { name: TABLE_INVERSE, type: "team2users" },
      },
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new Require(new True())],
    });
  }
}

/**
 * An Ent which is either sharded (if owner_id points to EntTestUser) or in
 * GLOBAL_SHARD (if owner_id points to EntTestCompany).
 */
class EntTestTopic extends BaseEnt(
  testCluster,
  new SQLSchema(
    'inverse"test_topic',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      owner_id: { type: ID }, // either EntTestUser (sharded) or EntTestCompany (global)
      slug: { type: String },
      sleep: { type: Number, allowNull: true, autoInsert: "0" },
    },
    ["owner_id", "slug"]
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      owner_id bigint NOT NULL,
      slug text NOT NULL,
      sleep integer NOT NULL,
      UNIQUE (owner_id, slug)
    )`,
    `CREATE OR REPLACE FUNCTION pg_sleep_trigger() RETURNS trigger LANGUAGE plpgsql SET search_path FROM CURRENT AS
      $$ BEGIN PERFORM pg_sleep(NEW.sleep); RETURN NEW; END $$`,
    "CREATE TRIGGER pg_sleep_trigger BEFORE INSERT ON %T FOR EACH ROW EXECUTE PROCEDURE pg_sleep_trigger()",
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: ["owner_id"],
      inverses: {
        owner_id: { name: TABLE_INVERSE, type: "owner2topics" },
      },
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new Require(new True())],
      beforeInsert: [
        async (_vc, { input }) => {
          if (input.slug === "throwInBeforeInsert") {
            throw Error("thrown in beforeInsert");
          }
        },
      ],
    });
  }
}

let vc: VC;

beforeEach(async () => {
  await recreateTestTables(
    [EntTestCompany, EntTestUser, EntTestTopic],
    TABLE_INVERSE
  );

  vc = createVC();
});

test("CRUD", async () => {
  const companyID1 = "1000000000000000010";
  const teamID1 = "1000100000000000020";

  let user = await EntTestUser.insertReturning(vc, {
    company_id: companyID1,
    team_id: teamID1,
    name: "u1",
  });

  expect(await EntTestUser.INVERSES[0].id2s(vc, companyID1)).toEqual([user.id]);
  expect(await EntTestUser.INVERSES[1].id2s(vc, teamID1)).toEqual([user.id]);

  const companyID2 = "1000100000000000012";
  const teamID2 = "1000000000000000022";

  user = await user.updateReturningX({
    company_id: companyID2,
    team_id: teamID2,
  });

  expect(await EntTestUser.INVERSES[0].id2s(vc, companyID1)).toEqual([]);
  expect(await EntTestUser.INVERSES[1].id2s(vc, teamID1)).toEqual([]);
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

test("cross-shard selectChunked", async () => {
  const companyID = "1000100000000000912";
  await mapJoin(range(1, 3), async (shardNo) =>
    mapJoin(range(5), async () =>
      createUserInShard({
        vc,
        shardNo,
        startCompanyID: companyID,
        startTeamID: "1000000000000000001",
        increment: "teamID",
      })
    )
  );
  const chunkLens = await mapJoin(
    collect(EntTestUser.selectChunked(vc, { company_id: companyID }, 2, 8)),
    async (chunk) => chunk.length
  );
  expect(chunkLens).toEqual([2, 2, 1, 2, 1]);
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

test("race condition in insert/loadBy", async () => {
  for (let i = 0; i < 5; i++) {
    const COUNT = 2;
    const company = await EntTestCompany.insertReturning(vc, {
      name: "c" + i,
    });
    const insertedTopicIDs = uniq(
      await mapJoin(range(0, COUNT), async () => {
        const key = {
          owner_id: company.id,
          slug: "topic",
        };
        const id = await EntTestTopic.insertIfNotExists(vc, key);
        if (id) {
          return id;
        }

        return (await EntTestTopic.loadByX(vc, key)).id;
      })
    );
    expect(insertedTopicIDs).toHaveLength(1);
  }
});

test("inverses are deleted when ent insert DB operation fails", async () => {
  testCluster.options.locateIslandErrorRetryCount = 0;
  const company = await EntTestCompany.insertReturning(vc, {
    name: "my-company",
  });
  await mapJoin(testCluster.nonGlobalShards(), async (shard) => {
    const master = await shard.client(MASTER);
    await master.rows(
      "DROP TABLE IF EXISTS %T CASCADE",
      EntTestTopic.SCHEMA.name
    );
  });
  await expect(
    EntTestTopic.insertIfNotExists(vc, {
      owner_id: company.id,
      slug: "topic",
    })
  ).rejects.toThrow(ShardError);
  const inverse = EntTestTopic.INVERSES[0];
  expect(await inverse.id2s(vc, company.id)).toEqual([]);
});

test("inverses are deleted when beforeInsert trigger throws with any error", async () => {
  const company = await EntTestCompany.insertReturning(vc, {
    name: "my-company",
  });
  await expect(
    EntTestTopic.insertIfNotExists(vc, {
      owner_id: company.id,
      slug: "throwInBeforeInsert",
    })
  ).rejects.toThrow(Error);
  const inverse = EntTestTopic.INVERSES[0];
  expect(await inverse.id2s(vc, company.id)).toEqual([]);
});

test("inverses are not deleted when ent creation times out", async () => {
  const company = await EntTestCompany.insertReturning(vc, {
    name: "my-company",
  });
  const promise = EntTestTopic.insertIfNotExists(vc, {
    owner_id: company.id,
    slug: "pg_sleep",
    sleep: 5,
  }).catch((e) => e.message);
  await delay(1000);
  await mapJoin(testCluster.nonGlobalShards(), async (shard) => {
    const master = await shard.client(MASTER);
    await master.end(true).catch(() => {});
  });
  expect(await promise).toContain("Connection terminated unexpectedly");
  // On an accidental disconnect, we don't know, whether the DB applied the
  // insert or not, so we should expect Ent Framework to NOT delete the inverse.
  const inverse = EntTestTopic.INVERSES[0];
  expect(await inverse.id2s(vc, company.id)).toHaveLength(1);
});

test("loadBy with multiple shard candidates", async () => {
  const companyID = "1000000000000000001";
  // Creates an inverse from companyID to shard 1.
  await createUserInShard({
    vc,
    shardNo: 1,
    startCompanyID: companyID,
    startTeamID: "1000000000000000001",
    increment: "teamID",
  });
  // Creates an inverse from companyID to shard 2.
  const user2 = await createUserInShard({
    vc,
    shardNo: 2,
    startCompanyID: companyID,
    startTeamID: "1000000000000010001",
    increment: "teamID",
  });
  // Now for companyID, we'll have 2 shard candidates (1 and 2), and they'll
  // both be rechecked. Shard 1 will return empty results, and shard 2 will
  // return the user. Make sure that we really get a first non-empty response.
  await EntTestUser.loadByX(vc, {
    company_id: companyID,
    team_id: user2.team_id,
  });
});

test("multiShardsFromInput returns minimal number of shard candidates", async () => {
  const sharedTeamID = "1000000000000000011";
  // Add the 1st inverse to the 1st shard.
  const user1 = await createUserInShard({
    vc,
    shardNo: 1,
    startCompanyID: "1000000000000000001",
    startTeamID: sharedTeamID,
    increment: "companyID",
  });
  // Add the 2nd inverse to the 2nd shard from the same sharedTeamID
  const user2 = await createUserInShard({
    vc,
    shardNo: 2,
    startCompanyID: "1000000000000100001",
    startTeamID: sharedTeamID,
    increment: "companyID",
  });
  // Since company_id is mentioned earlier in the list of fields with inverses,
  // and we filter by it, ShardLocator should only resolve shard candidates
  // based on company_id and never based on team_id. And we know that only one
  // user (= one shard) is associated with a user1.company_id.
  expect(user1.company_id).not.toEqual(user2.company_id);
  const shards = await EntTestUser.SHARD_LOCATOR.multiShardsFromInput(
    vc,
    { company_id: user1.company_id, team_id: sharedTeamID },
    "loadBy"
  );
  expect(shards).toHaveLength(1);
});

test("exception", async () => {
  await expect(EntTestUser.select(vc, { name: "u2" }, 42)).rejects.toThrow(
    EntCannotDetectShardError
  );
});

test("id2s single", async () => {
  const companyID1 = "1000000000000000010";
  const teamID = "1000000000000000090";
  const u1 = await EntTestUser.insertReturning(vc, {
    company_id: companyID1,
    team_id: teamID,
    name: "u1",
  });
  const master = await testCluster.globalShard().client(MASTER);
  master.resetSnapshot();
  const id2s = await EntTestUser.INVERSES[0].id2s(
    vc.withEmptyCache(),
    companyID1
  );
  expect(id2s).toEqual([u1.id]);
  master.toMatchSnapshot();
});

test("id2s batched", async () => {
  const companyID1 = "1000000000000000010";
  const companyID2 = "1000000000000000020";
  const teamID = "1000000000000000090";

  const [u1, u2, u3, u4, u5] = await join([
    EntTestUser.insertReturning(vc, {
      company_id: companyID1,
      team_id: null,
      name: "u1",
    }),
    EntTestUser.insertReturning(vc, {
      company_id: companyID1, // same companyID1
      team_id: null,
      name: "u2",
    }),
    EntTestUser.insertReturning(vc, {
      company_id: companyID2,
      team_id: null,
      name: "u3",
    }),
    EntTestUser.insertReturning(vc, {
      company_id: null,
      team_id: null,
      name: "u4",
    }),
    EntTestUser.insertReturning(vc, {
      company_id: null,
      team_id: teamID,
      name: "u5",
    }),
  ]);

  const master = await testCluster.globalShard().client(MASTER);
  master.resetSnapshot();
  const [company1UserIDs, company2UserIDs, companyNullUserIDs, teamUserIDs] =
    await join([
      EntTestUser.INVERSES[0].id2s(vc.withEmptyCache(), companyID1),
      EntTestUser.INVERSES[0].id2s(vc.withEmptyCache(), companyID2),
      EntTestUser.INVERSES[0].id2s(vc.withEmptyCache(), null),
      EntTestUser.INVERSES[1].id2s(vc.withEmptyCache(), teamID),
    ]);
  expect(company1UserIDs).toEqual([u1.id, u2.id].sort());
  expect(company2UserIDs).toEqual([u3.id].sort());
  expect(companyNullUserIDs).toEqual([u4.id, u5.id].sort());
  expect(teamUserIDs).toEqual([u5.id].sort());
  master.toMatchSnapshot();
});

/**
 * Tries to insert EntTestUser multiple times until it succeeds inserting it to
 * shardNo. Since shard number generation is randomly-deterministic by unique
 * key fields (which are [company_id, team_id] in this case), we need to vary
 * either company_id or team_id when inserting more users: we allow the caller
 * to specify, which one to increment.
 */
async function createUserInShard({
  vc,
  shardNo,
  startCompanyID,
  startTeamID,
  increment,
}: {
  vc: VC;
  shardNo: number;
  startCompanyID: string;
  startTeamID: string;
  increment: "companyID" | "teamID";
}): Promise<EntTestUser> {
  for (let i = 1; i <= 100; i++) {
    const user = await EntTestUser.insertReturning(vc, {
      company_id: (
        BigInt(startCompanyID) + BigInt(increment === "companyID" ? i : 0)
      ).toString(),
      team_id: (
        BigInt(startTeamID) + BigInt(increment === "teamID" ? i : 0)
      ).toString(),
      name: "u" + i,
    });
    if (testCluster.shard(user.id).no === shardNo) {
      return user;
    } else {
      await user.deleteOriginal();
    }
  }

  throw Error(`Weird: couldn't create an EntTestUser in shard ${shardNo}`);
}
