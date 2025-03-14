import { inspect } from "util";
import { recreateTestTables, testCluster } from "../../pg/__tests__/test-utils";
import { PgSchema } from "../../pg/PgSchema";
import { ID } from "../../types";
import { BaseEnt } from "../BaseEnt";
import { CanReadOutgoingEdge } from "../predicates/CanReadOutgoingEdge";
import { CanUpdateOutgoingEdge } from "../predicates/CanUpdateOutgoingEdge";
import { OutgoingEdgePointsToVC } from "../predicates/OutgoingEdgePointsToVC";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import { GLOBAL_SHARD } from "../ShardAffinity";
import { type VC } from "../VC";
import { createVC, expectToMatchSnapshot } from "./test-utils";

const $EPHEMERAL = Symbol("$EPHEMERAL");
const $EPHEMERAL2 = Symbol("$EPHEMERAL2");

/**
 * User
 */
class EntTestUser extends BaseEnt(
  testCluster,
  new PgSchema(
    'ent.triggers"user',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      name: { type: String },
      url_name: { type: String, allowNull: true },
      is_alseeing: { type: Boolean, autoInsert: "false" },
      created_at: { type: Date, autoInsert: "now()" },
      updated_at: { type: Date, autoUpdate: "now()" },
    },
    ["name"],
  ),
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
      privacyInferPrincipal: (_vc, row) => row.id,
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
class EntTestHeadline extends BaseEnt(
  testCluster,
  new PgSchema(
    'ent.triggers"headline',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      user_id: { type: ID },
      headline: { type: String },
      name: { type: String, allowNull: true, autoInsert: "NULL" },
      [$EPHEMERAL]: { type: String, allowNull: true }, // required, but nullable
      [$EPHEMERAL2]: { type: Number, autoInsert: "NULL" }, // optional (can be skipped), but if present, must be non-nullable
    },
    [],
  ),
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
    op?: string;
    oldRow?: unknown;
    newRow?: unknown;
    newOrOldRow?: unknown;
    input?: unknown;
  }> = [];

  static override configure() {
    return new this.Configuration({
      shardAffinity: [],
      privacyInferPrincipal: async (_vc, row) => row.user_id,
      privacyLoad: [
        new AllowIf(new CanReadOutgoingEdge("user_id", EntTestUser)),
      ],
      privacyInsert: [
        new Require(new CanUpdateOutgoingEdge("user_id", EntTestUser)),
      ],
      beforeInsert: [
        (_vc, { input }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "beforeInsert1",
            input: { ...input },
          });
          input.headline += " added-by-beforeInsert1";
          expectRequired(input[$EPHEMERAL], "yes");
          if (input[$EPHEMERAL2]) {
            input[$EPHEMERAL2] += 1000;
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
        (_vc, { newRow, oldRow, input }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "beforeUpdate",
            oldRow,
            newRow,
            input: { ...input },
          });
          input.headline = newRow.headline + " added-by-beforeUpdate";
          expectRequired(newRow[$EPHEMERAL], "no");
          expectRequired(input[$EPHEMERAL], "no");
          if (input[$EPHEMERAL2]) {
            input[$EPHEMERAL2] += 1000000;
          }
        },
        [
          (_vc, row) => [row.name],
          async (_vc, { newRow, oldRow, input }) => {
            EntTestHeadline.TRIGGER_CALLS.push({
              type: "beforeUpdate (if name changed)",
              newRow,
              oldRow,
              input: { ...input },
            });
          },
        ],
      ],
      beforeDelete: [
        async (_vc, { oldRow }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "beforeDelete",
            oldRow,
          });
        },
      ],
      beforeMutation: [
        (_vc, { op, newOrOldRow, input }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "beforeMutation",
            op,
            newOrOldRow,
            input: { ...input },
          });
          op === "INSERT" &&
            expectRequired(newOrOldRow[$EPHEMERAL], "yes") &&
            expectRequired(input[$EPHEMERAL], "yes");
          op === "UPDATE" &&
            expectRequired(newOrOldRow[$EPHEMERAL], "no") &&
            expectRequired(input[$EPHEMERAL], "no");
          op === "DELETE" &&
            expectRequired(newOrOldRow[$EPHEMERAL], "no") &&
            expectRequired(input[$EPHEMERAL], "no");
          expectRequired(newOrOldRow[$EPHEMERAL], "no");
          expectRequired(input[$EPHEMERAL], "no");
          expectRequired(newOrOldRow[$EPHEMERAL2], "no");
          if (input.user_id) {
            input.user_id = input.user_id + ""; // input is not readonly
          }
        },
        [
          (_vc, row) => [row.name],
          async (_vc, { op, newOrOldRow, input }) => {
            EntTestHeadline.TRIGGER_CALLS.push({
              type: "beforeMutation (if name changed or INSERT/DELETE)",
              op,
              newOrOldRow,
              input: { ...input },
            });
          },
        ],
      ],
      afterInsert: [
        async (_vc, { input }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "afterInsert",
            input: { ...input },
          });
          expectRequired(input[$EPHEMERAL], "yes");
          expectRequired(input[$EPHEMERAL2], "no");
        },
      ],
      afterUpdate: [
        (_vc, { newRow, oldRow }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "afterUpdate",
            oldRow,
            newRow,
          });
          expectRequired(newRow[$EPHEMERAL], "no");
          expectRequired(newRow[$EPHEMERAL2], "no");
        },
        [
          (_vc, row) => [row.name],
          async (_vc, { newRow, oldRow }) => {
            EntTestHeadline.TRIGGER_CALLS.push({
              type: "afterUpdate (if name changed)",
              oldRow,
              newRow,
            });
          },
        ],
      ],
      afterDelete: [
        async (_vc, { oldRow }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "afterDelete",
            oldRow,
          });
        },
      ],
      afterMutation: [
        (_vc, { op, newOrOldRow }) => {
          EntTestHeadline.TRIGGER_CALLS.push({
            type: "afterMutation",
            op,
            newOrOldRow,
          });
          op === "INSERT" && expectRequired(newOrOldRow[$EPHEMERAL], "yes");
          op === "UPDATE" && expectRequired(newOrOldRow[$EPHEMERAL], "no");
          op === "DELETE" && expectRequired(newOrOldRow[$EPHEMERAL], "no");
          expectRequired(newOrOldRow[$EPHEMERAL], "no");
          expectRequired(newOrOldRow[$EPHEMERAL2], "no");
        },
        [
          (_vc, row) => [row.name],
          async (_vc, { op, newOrOldRow }) => {
            EntTestHeadline.TRIGGER_CALLS.push({
              type: "afterMutation (if name changed or INSERT/DELETE)",
              op,
              newOrOldRow,
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
class EntTestCountry extends BaseEnt(
  testCluster,
  new PgSchema(
    'ent.triggers"country',
    {
      id: { type: String, autoInsert: "id_gen()" },
      name: { type: String, allowNull: true, autoInsert: "NULL" },
    },
    ["name"],
  ),
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
    old?: unknown;
    new?: unknown;
    input?: unknown;
  }> = [];

  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyInferPrincipal: null,
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
    "0: insert happened",
  );

  EntTestHeadline.TRIGGER_CALLS.splice(0);
  const headline = await EntTestHeadline.insertReturning(vc, {
    user_id: vc.principal,
    headline: "abc",
    [$EPHEMERAL]: "eph",
    [$EPHEMERAL2]: 42,
  });
  expect(headline.headline).toEqual(
    "abc added-by-beforeInsert1 added-by-beforeInsert2",
  );
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "1: insert happened",
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
    "2: update happened",
  );

  EntTestHeadline.TRIGGER_CALLS.splice(0);
  const headline3 = await headline.updateReturningX({
    [$EPHEMERAL]: "eph3",
  });
  expect(headline3.headline).toEqual(
    "abc added-by-beforeInsert1 added-by-beforeInsert2 added-by-beforeUpdate",
  );
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "3: noop-update happened",
  );

  EntTestHeadline.TRIGGER_CALLS.splice(0);
  await headline.updateChanged({
    [$EPHEMERAL]: "eph4",
  });
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "4: updateChanged happened",
  );

  EntTestHeadline.TRIGGER_CALLS.splice(0);
  await headline.deleteOriginal();
  expect(await EntTestHeadline.loadNullable(vc, headline.id)).toBeNull();
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "5: delete happened",
  );
});

test("skip after triggers if operation soft fails", async () => {
  await EntTestCountry.insertReturning(vc, { name: "zzz" });

  EntTestCountry.TRIGGER_CALLS.splice(0);
  const abc = await EntTestCountry.insertReturning(vc, { name: "abc" });
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "1: insert happened",
  );

  EntTestCountry.TRIGGER_CALLS.splice(0);
  await EntTestCountry.insertIfNotExists(vc, { name: "abc" });
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "2: insert soft-failed on unique key conflict",
  );

  await abc.deleteOriginal();

  EntTestCountry.TRIGGER_CALLS.splice(0);
  await abc.updateOriginal({ name: "zzz" });
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "3: update soft-failed on non-existing row",
  );

  EntTestCountry.TRIGGER_CALLS.splice(0);
  await abc.deleteOriginal();
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "4: delete soft-failed on non-existing row",
  );
});

test("inserting Ents with custom IDs when they have beforeInsert triggers", async () => {
  const ent = await EntTestCountry.insertReturning(vc.toOmniDangerous(), {
    name: "Test",
  });
  await ent.deleteOriginal();
  const newEnt = await EntTestCountry.insertReturning(
    vc.toOmniDangerous(),
    ent,
  );
  expect(newEnt.id).toEqual(ent.id);
});

function expectRequired<T>(
  _value: T,
  _flag: [T] extends [never] ? "no" : undefined extends T ? "no" : "yes",
): true {
  return true;
}
