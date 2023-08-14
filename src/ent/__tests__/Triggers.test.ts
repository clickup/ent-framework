import { inspect } from "util";
import {
  recreateTestTables,
  testCluster,
} from "../../sql/__tests__/test-utils";
import { SQLSchema } from "../../sql/SQLSchema";
import { ID } from "../../types";
import { BaseEnt, GLOBAL_SHARD } from "../BaseEnt";
import { CanReadOutgoingEdge } from "../predicates/CanReadOutgoingEdge";
import { CanUpdateOutgoingEdge } from "../predicates/CanUpdateOutgoingEdge";
import { OutgoingEdgePointsToVC } from "../predicates/OutgoingEdgePointsToVC";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import type { VC } from "../VC";
import { createVC, expectToMatchSnapshot } from "./test-utils";

const $EPHEMERAL = Symbol("$EPHEMERAL");
const $EPHEMERAL2 = Symbol("$EPHEMERAL2");

/**
 * User
 */
export class EntTestUser extends BaseEnt(
  testCluster,
  new SQLSchema(
    'ent.triggers"user',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      name: { type: String },
      url_name: { type: String, allowNull: true },
      is_alseeing: { type: Boolean, autoInsert: "false" },
      created_at: { type: Date, autoInsert: "now()" },
      updated_at: { type: Date, autoUpdate: "now()" },
    },
    ["name"]
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      company_id bigint DEFAULT NULL,
      name text NOT NULL,
      url_name text,
      is_alseeing boolean,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL,
      UNIQUE (name)
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyInferPrincipal: async (_vc, { id }) => id,
      privacyLoad: [new AllowIf(new OutgoingEdgePointsToVC("id"))],
      privacyInsert: [],
      privacyUpdate: [new Require(new OutgoingEdgePointsToVC("id"))],
    });
  }

  nameUpper(): string {
    return this.name.toUpperCase();
  }
}

/**
 * Headline -> User -> Company
 */
export class EntTestHeadline extends BaseEnt(
  testCluster,
  new SQLSchema(
    'ent.triggers"headline',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      user_id: { type: ID },
      headline: { type: String },
      name: { type: String, allowNull: true, autoInsert: "NULL" },
      [$EPHEMERAL]: { type: String, allowNull: true }, // required, but nullable
      [$EPHEMERAL2]: { type: Number, autoInsert: "NULL" }, // optional (can be skipped), but if present, must be non-nullable
    },
    []
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      user_id bigint NOT NULL,
      headline text NOT NULL,
      name text
    )`,
  ];

  static readonly TRIGGER_CALLS: Array<{
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

/**
 * Country
 */
export class EntTestCountry extends BaseEnt(
  testCluster,
  new SQLSchema(
    'ent.triggers"country',
    {
      id: { type: String, autoInsert: "id_gen()" },
      name: { type: String, allowNull: true, autoInsert: "NULL" },
    },
    ["name"]
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      name text,
      UNIQUE(name)
    )`,
  ];

  static readonly TRIGGER_CALLS: Array<{
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

let vc: VC;

beforeEach(async () => {
  await recreateTestTables([EntTestUser, EntTestHeadline, EntTestCountry]);

  const user = await EntTestUser.insertReturning(createVC().toOmniDangerous(), {
    name: "John",
    url_name: "john",
  });
  expect(user.vc.principal).toEqual(user.id);
  vc = user.vc;
});

test("triggers", async () => {
  EntTestHeadline.TRIGGER_CALLS.splice(0);
  await EntTestHeadline.insertReturning(vc, {
    user_id: vc.principal,
    headline: "xyz",
    [$EPHEMERAL]: null,
  });
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "0: insert happened"
  );

  EntTestHeadline.TRIGGER_CALLS.splice(0);
  const headline = await EntTestHeadline.insertReturning(vc, {
    user_id: vc.principal,
    headline: "abc",
    [$EPHEMERAL]: "eph",
    [$EPHEMERAL2]: 42,
  });
  expect(headline.headline).toEqual(
    "abc added-by-beforeInsert1 added-by-beforeInsert2"
  );
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "1: insert happened"
  );

  EntTestHeadline.TRIGGER_CALLS.splice(0);
  const headline2 = await headline.updateReturningX({
    headline: "xyz-updated",
    name: "new-name",
    [$EPHEMERAL2]: 101,
  });
  expect(headline2.headline).toEqual("xyz-updated added-by-beforeUpdate");
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "2: update happened"
  );

  EntTestHeadline.TRIGGER_CALLS.splice(0);
  const headline3 = await headline.updateReturningX({
    [$EPHEMERAL]: "eph3",
  });
  expect(headline3.headline).toEqual(
    "abc added-by-beforeInsert1 added-by-beforeInsert2 added-by-beforeUpdate"
  );
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "3: noop-update happened"
  );

  EntTestHeadline.TRIGGER_CALLS.splice(0);
  await headline.updateChanged({
    [$EPHEMERAL]: "eph4",
  });
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "4: updateChanged happened"
  );

  EntTestHeadline.TRIGGER_CALLS.splice(0);
  await headline.deleteOriginal();
  expect(await EntTestHeadline.loadNullable(vc, headline.id)).toBeNull();
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "5: delete happened"
  );
});

test("skip after triggers if operation soft fails", async () => {
  await EntTestCountry.insertReturning(vc, { name: "zzz" });

  EntTestCountry.TRIGGER_CALLS.splice(0);
  const abc = await EntTestCountry.insertReturning(vc, { name: "abc" });
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "1: insert happened"
  );

  EntTestCountry.TRIGGER_CALLS.splice(0);
  await EntTestCountry.insertIfNotExists(vc, { name: "abc" });
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "2: insert soft-failed on unique key conflict"
  );

  await abc.deleteOriginal();

  EntTestCountry.TRIGGER_CALLS.splice(0);
  await abc.updateOriginal({ name: "zzz" });
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "3: update soft-failed on non-existing row"
  );

  EntTestCountry.TRIGGER_CALLS.splice(0);
  await abc.deleteOriginal();
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "4: delete soft-failed on non-existing row"
  );
});

test("inserting Ents with custom IDs when they have beforeInsert triggers", async () => {
  const ent = await EntTestCountry.insertReturning(vc.toOmniDangerous(), {
    name: "Test",
  });
  await ent.deleteOriginal();
  const newEnt = await EntTestCountry.insertReturning(
    vc.toOmniDangerous(),
    ent
  );
  expect(newEnt.id).toEqual(ent.id);
});
