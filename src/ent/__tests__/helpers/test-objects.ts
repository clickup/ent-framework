import { MASTER } from "../../../abstract/Shard";
import { join, mapJoin } from "../../../helpers";
import { testCluster } from "../../../sql/__tests__/helpers/TestSQLClient";
import { SQLSchema } from "../../../sql/SQLSchema";
import { ID } from "../../../types";
import { BaseEnt } from "../../BaseEnt";
import { GLOBAL_SHARD } from "../../Configuration";
import { CanReadOutgoingEdge } from "../../predicates/CanReadOutgoingEdge";
import { CanUpdateOutgoingEdge } from "../../predicates/CanUpdateOutgoingEdge";
import { IncomingEdgeFromVCExists } from "../../predicates/IncomingEdgeFromVCExists";
import { OutgoingEdgePointsToVC } from "../../predicates/OutgoingEdgePointsToVC";
import { True } from "../../predicates/True";
import { AllowIf } from "../../rules/AllowIf";
import { Require } from "../../rules/Require";
import { VC } from "../../VC";
import { VCWithQueryCache } from "../../VCFlavor";

const TABLE_COMPANY = 'ent"company';
const TABLE_USER = 'ent"user';
const TABLE_POST = 'ent"post';
const TABLE_COMMENT = 'ent"comment';
const TABLE_HEADLINE = 'ent"headline';
const TABLE_COUNTRY = 'ent"country';

export const vcTestGuest =
  VC.createGuestPleaseDoNotUseCreationPointsMustBeLimited().withTransitiveMasterFreshness();

// Company

const schemaTestCompany = new SQLSchema(
  TABLE_COMPANY,
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String },
  },
  ["name"]
);

export class EntTestCompany extends BaseEnt(testCluster, schemaTestCompany) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyLoad: [
        new AllowIf(async function VCIsAllSeeing(vc, _company) {
          const vcUser = await EntTestUser.loadX(vc, vc.principal);
          return vcUser.is_alseeing;
        }),
        new AllowIf(
          new IncomingEdgeFromVCExists(EntTestUser, "id", "company_id")
        ),
      ],
      privacyInsert: [],
    });
  }
}

// User -> Company

const schemaTestUser = new SQLSchema(
  TABLE_USER,
  {
    id: { type: ID, autoInsert: "id_gen()" },
    company_id: { type: ID, allowNull: true, autoInsert: "NULL" },
    name: { type: String },
    url_name: { type: String, allowNull: true },
    is_alseeing: { type: Boolean, autoInsert: "false" },
    created_at: { type: Date, autoInsert: "now()" },
    updated_at: { type: Date, autoUpdate: "now()" },
  },
  ["name"]
);

export class EntTestUser extends BaseEnt(testCluster, schemaTestUser) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyInferPrincipal: async (_vc, { id }) => id,
      privacyLoad: [
        new AllowIf(new OutgoingEdgePointsToVC("id")),
        new AllowIf(new CanReadOutgoingEdge("company_id", EntTestCompany)),
      ],
      privacyInsert: [],
      privacyUpdate: [new Require(new OutgoingEdgePointsToVC("id"))],
    });
  }

  nameUpper() {
    return this.name.toUpperCase();
  }
}

// Post -> User -> Company

const schemaTestPost = new SQLSchema(
  TABLE_POST,
  {
    post_id: { type: ID, autoInsert: "id_gen()" },
    user_id: { type: ID },
    title: { type: String },
    created_at: { type: Date, autoInsert: "now()" },
  },
  ["post_id"]
);

export class EntTestPost extends BaseEnt(testCluster, schemaTestPost) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: ["post_id"],
      privacyLoad: [
        new AllowIf(new CanReadOutgoingEdge("user_id", EntTestUser)),
      ],
      privacyInsert: [
        new Require(new CanUpdateOutgoingEdge("user_id", EntTestUser)),
      ],
      privacyUpdate: [
        new Require(async function VCInSameCompany(vc, post) {
          // A post can be updated by anyone in the same company.
          const postUser = await EntTestUser.loadX(vc, post.user_id);
          const vcUser = await EntTestUser.loadX(vc, vc.principal);
          return postUser.company_id === vcUser.company_id;
        }),
      ],
    });
  }

  titleUpper() {
    return this.title.toUpperCase();
  }

  async user() {
    return EntTestUser.loadX(this.vc, this.user_id);
  }
}

// Comment -> Post -> User -> Company

const schemaTestComment = new SQLSchema(
  TABLE_COMMENT,
  {
    comment_id: { type: String, autoInsert: "id_gen()" },
    post_id: { type: ID },
    text: { type: String },
  },
  ["comment_id"]
);

export class EntTestComment extends BaseEnt(testCluster, schemaTestComment) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: ["post_id"],
      privacyLoad: [
        new AllowIf(new CanReadOutgoingEdge("post_id", EntTestPost)),
      ],
      privacyInsert: [
        new Require(new CanUpdateOutgoingEdge("post_id", EntTestPost)),
      ],
    });
  }

  textUpper() {
    return this.text.toUpperCase();
  }
}

// Headline -> User -> Company

export const $EPHEMERAL = Symbol("$EPHEMERAL");
export const $EPHEMERAL2 = Symbol("$EPHEMERAL2");

const schemaTestHeadline = new SQLSchema(TABLE_HEADLINE, {
  id: { type: ID, autoInsert: "id_gen()" },
  user_id: { type: ID },
  headline: { type: String },
  name: { type: String, allowNull: true, autoInsert: "NULL" },
  [$EPHEMERAL]: { type: String, allowNull: true }, // required, but nullable
  [$EPHEMERAL2]: { type: Number, autoInsert: "NULL" }, // optional (can be skipped), but if present, must be non-nullable
});

export class EntTestHeadline extends BaseEnt(testCluster, schemaTestHeadline) {
  static TRIGGER_CALLS: Array<{
    type: string;
    old?: any;
    new?: any;
    input?: any;
  }> = [];

  static override configure() {
    return new this.Configuration({
      shardAffinity: [],
      privacyLoad: [
        new AllowIf(new CanReadOutgoingEdge("user_id", EntTestUser)),
      ],
      privacyInsert: [
        new Require(new CanUpdateOutgoingEdge("user_id", EntTestUser)),
      ],
      beforeInsert: [
        async (_vc, { input }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "beforeInsert1",
            input: { ...input },
          });
          input.headline += " added-by-beforeInsert1";
          if (input[$EPHEMERAL2]) {
            input[$EPHEMERAL2]! += 1000;
          }
        },
        async (_vc, { input }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "beforeInsert2",
            input: { ...input },
          });
          input.headline += " added-by-beforeInsert2";
        },
      ],
      beforeUpdate: [
        async (_vc, { newRow, oldRow, input }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "beforeUpdate",
            old: oldRow,
            new: newRow,
            input: { ...input },
          });
          input.headline = newRow.headline + " added-by-beforeUpdate";
          if (input[$EPHEMERAL2]) {
            input[$EPHEMERAL2]! += 1000000;
          }
        },
      ],
      beforeDelete: [
        async (_vc, { oldRow }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "beforeDelete",
            old: oldRow,
          });
        },
      ],
      afterInsert: [
        async (_vc, { input }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "afterInsert",
            input: { ...input },
          });
        },
      ],
      afterUpdate: [
        async (_vc, { newRow, oldRow }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "afterUpdate",
            old: oldRow,
            new: newRow,
          });
        },
        [
          (_vc, row) => JSON.stringify([row.name]),
          async (_vc, { newRow, oldRow }) => {
            EntTestHeadline.TRIGGER_CALLS.push({
              type: "afterUpdate (if name changed)",
              old: oldRow,
              new: newRow,
            });
          },
        ],
      ],
      afterDelete: [
        async (_vc, { oldRow }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "afterDelete",
            old: oldRow,
          });
        },
      ],
      afterMutation: [
        async (_vc, { newOrOldRow }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "afterMutation",
            input: newOrOldRow,
          });
        },
        [
          (_vc, row) => JSON.stringify([row.name]),
          async (_vc, { newOrOldRow }) => {
            EntTestHeadline.TRIGGER_CALLS.push({
              type: "afterMutation (if name changed)",
              input: newOrOldRow,
            });
          },
        ],
      ],
    });
  }
}

const schemaTestCountry = new SQLSchema(
  TABLE_COUNTRY,
  {
    id: { type: String, autoInsert: "id_gen()" },
    name: { type: String, allowNull: true, autoInsert: "NULL" },
  },
  ["name"]
);

export class EntTestCountry extends BaseEnt(testCluster, schemaTestCountry) {
  static TRIGGER_CALLS: Array<{
    type: string;
    old?: any;
    new?: any;
    input?: any;
  }> = [];

  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new Require(new True())],
      beforeInsert: [
        async (_vc, { input }) => {
          this.TRIGGER_CALLS.push({
            type: "beforeInsert",
            input: { ...input },
          });
        },
      ],
      beforeUpdate: [
        async (_vc, { newRow, oldRow, input }) => {
          this.TRIGGER_CALLS.push({
            type: "beforeUpdate",
            old: oldRow,
            new: newRow,
            input: { ...input },
          });
        },
      ],
      beforeDelete: [
        async (_vc, { oldRow }) => {
          this.TRIGGER_CALLS.push({
            type: "beforeDelete",
            old: oldRow,
          });
        },
      ],
      afterInsert: [
        async (_vc, { input }) => {
          this.TRIGGER_CALLS.push({
            type: "afterInsert",
            input: { ...input },
          });
        },
      ],
      afterUpdate: [
        async (_vc, { newRow, oldRow }) => {
          this.TRIGGER_CALLS.push({
            type: "afterUpdate",
            old: oldRow,
            new: newRow,
          });
        },
      ],
      afterDelete: [
        async (_vc, { oldRow }) => {
          this.TRIGGER_CALLS.push({
            type: "afterDelete",
            old: oldRow,
          });
        },
      ],
      afterMutation: [
        async (_vc, { newOrOldRow }) => {
          this.TRIGGER_CALLS.push({
            type: "afterMutation",
            input: newOrOldRow,
          });
        },
      ],
    });
  }
}

// Setup fixture

export async function init(): Promise<[VC, VC]> {
  const globalMaster = await testCluster.globalShard().client(MASTER);
  await join([
    globalMaster.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_COUNTRY),
    globalMaster.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_USER),
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
        company_id BIGINT DEFAULT NULL,
        name text NOT NULL,
        url_name text,
        is_alseeing boolean,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL,
        UNIQUE (name)
      )`,
      TABLE_USER
    ),
    globalMaster.rows(
      `CREATE TABLE %T(
        id bigint NOT NULL PRIMARY KEY,
        name text,
        UNIQUE(name)
      )`,
      TABLE_COUNTRY
    ),
  ]);

  await mapJoin(testCluster.nonGlobalShards(), async (shard) => {
    const master = await shard.client(MASTER);
    await join([
      master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_HEADLINE),
      master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_COMMENT),
      master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_POST),
    ]);
    await join([
      master.rows(
        `CREATE TABLE %T(
            post_id bigint NOT NULL PRIMARY KEY,
            user_id bigint NOT NULL,
            title text NOT NULL,
            created_at timestamptz NOT NULL
          )`,
        TABLE_POST
      ),
      master.rows(
        `CREATE TABLE %T(
            comment_id bigint NOT NULL PRIMARY KEY,
            post_id bigint NOT NULL,
            text text NOT NULL
          )`,
        TABLE_COMMENT
      ),
      master.rows(
        `CREATE TABLE %T(
            id bigint NOT NULL PRIMARY KEY,
            user_id bigint NOT NULL,
            headline text NOT NULL,
            name text
          )`,
        TABLE_HEADLINE
      ),
    ]);
  });

  const company = await EntTestCompany.insertReturning(
    createVC().toOmniDangerous(),
    { name: "some" }
  );

  const user = await EntTestUser.insertReturning(company.vc.toOmniDangerous(), {
    company_id: company.id,
    name: "John",
    url_name: "john",
  });
  expect(user.vc.principal).toEqual(user.id);

  const otherUser = await EntTestUser.insertReturning(
    company.vc.toOmniDangerous(),
    { name: Date.now().toString(), url_name: "" }
  );

  return [user.vc, otherUser.vc];
}

export function createVC() {
  const vc = vcTestGuest.withFlavor(new VCWithQueryCache({ maxQueries: 1000 }));
  (vc as any).freshness = null;
  return vc;
}

export function expectToMatchSnapshot(str: string, snapshotName?: string) {
  const exp = expect(
    str.replace(/\b(vc:\w+)\(\d+\)/g, "$1").replace(/\d{10,}/g, "<id>")
  );
  snapshotName ? exp.toMatchSnapshot(snapshotName) : exp.toMatchSnapshot();
}
