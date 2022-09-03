import { ID } from "../../types";
import { EntNotReadableError } from "../errors/EntNotReadableError";
import { FieldIs } from "../predicates/FieldIs";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { DenyIf } from "../rules/DenyIf";
import { Require } from "../rules/Require";
import { Validation } from "../Validation";
import { createVC } from "./helpers/test-objects";
import ValidationTester from "./helpers/ValidationTester";

const companyTable = {
  id: { type: ID },
  tenant_id: { type: ID },
} as const;

const vc = createVC();

test("0000_load_succeeds_when_first_rule_allows", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [
        new AllowIf(async function First(_vc, _row) {
          return tester.respond("First", true);
        }),
        new AllowIf(async function Second(_vc, _row) {
          return tester.respond("Second", false);
        }),
      ],
      insert: [],
    }),
    { id: "123", tenant_id: "42" },
    "validateLoad",
    undefined,
    vc.toLowerInternal("42")
  );
});

test("0010_load_succeeds_when_any_rule_allows", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [
        new AllowIf(async function First(_vc, _row) {
          return tester.respond("First", false);
        }),
        new AllowIf(async function Second(_vc, _row) {
          return tester.respond("Second", true);
        }),
      ],
      insert: [],
    }),
    { id: "123", tenant_id: "42" }
  );
});

test("0020_load_fails_when_first_rule_throws", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [
        new AllowIf(async function First(_vc, _row) {
          return tester.respond("First", Error("wild"));
        }),
      ],
      insert: [],
    }),
    { id: "123", tenant_id: "42" }
  );
});

test("0030_insert_succeeds_when_all_require_allow", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [
        new Require(async function First(_vc, row) {
          return tester.respond("First", true, row);
        }),
        new Require(async function Second(_vc, row) {
          return tester.respond("Second", true, row);
        }),
      ],
    }),
    { id: "123", tenant_id: "42" },
    "validateInsert",
    undefined,
    vc.toLowerInternal("42")
  );
});

test("0040_insert_fails_when_any_require_denies", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [
        new Require(async function First(_vc, _row) {
          return tester.respond("First", true);
        }),
        new Require(async function Second(_vc, _row) {
          return tester.respond("Second", false);
        }),
      ],
    }),
    { id: "123", tenant_id: "42" }
  );
});

test("0041_update_fails_when_any_require_denies", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [],
      update: [
        new Require(async function First(_vc, _row) {
          return tester.respond("First", true);
        }),
        new Require(async function Second(_vc, _row) {
          return tester.respond("Second", false);
        }),
      ],
    }),
    { id: "123", tenant_id: "42" },
    "validateUpdate",
    undefined,
    vc.toLowerInternal("42")
  );
});

test("0042_delete_fails_when_any_require_denies", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [],
      delete: [
        new Require(async function First(_vc, _row) {
          return tester.respond("First", true);
        }),
        new Require(async function Second(_vc, _row) {
          return tester.respond("Second", false);
        }),
      ],
    }),
    { id: "123", tenant_id: "42" },
    "validateDelete",
    undefined,
    vc.toLowerInternal("42")
  );
});

test("0043_update_fails_when_user_errors", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [new AllowIf(new True())],
      validate: [
        new FieldIs("tenant_id", (_value) => false, "some one"),
        new FieldIs("tenant_id", (_value) => false, "some two"),
      ],
    }),
    { id: "123", tenant_id: "42" },
    "validateUpdate",
    { tenant_id: "42" }
  );
});

test("0044_update_succeeds_user_validation_when_field_untouched", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [new AllowIf(new True())],
      validate: [new FieldIs("id", (_value) => false, "some one")],
    }),
    { id: "123", tenant_id: "42" },
    "validateUpdate",
    { tenant_id: "101" }
  );
});

test("0050_insert_fails_when_any_require_throws", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [
        new Require(async function First(_vc, _row) {
          return tester.respond("First", true);
        }),
        new Require(async function Second(_vc, _row) {
          return tester.respond("Second", Error("wild"));
        }),
      ],
    }),
    { id: "123", tenant_id: "42" }
  );
});

test("0060_load_succeeds_when_any_rule_allows_even_if_another_rule_throws_not_readable_error", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [
        new AllowIf(async function First(vc, _row) {
          return tester.respond(
            "First",
            // Not a "wild" exception (since derived from EntAccessError).
            new EntNotReadableError(
              "other_table",
              vc.toString(),
              { id: "987" },
              { message: "ent access error" }
            )
          );
        }),
        new AllowIf(async function Second(_vc, _row) {
          return tester.respond("Second", true);
        }),
      ],
      insert: [],
    }),
    { id: "123", tenant_id: "42" }
  );
});

test("0070_load_fails_when_any_rule_allows_but_another_rule_throws_any_wild_exception", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [
        new AllowIf(async function First(_vc, _row) {
          // "Wild" means "not derived from EntAccessError"
          return tester.respond("First", Error("wild"));
        }),
        new AllowIf(async function Second(_vc, _row) {
          return tester.respond("Second", true);
        }),
      ],
      insert: [],
    }),
    { id: "123", tenant_id: "42" }
  );
});

test("0080_validations_fail_when_no_rules_defined", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [],
    }),
    { id: "123", tenant_id: "42" },
    "validateLoad"
  );
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [],
    }),
    { id: "123", tenant_id: "42" },
    "validateInsert"
  );
});

test("0090_load_fails_with_nice_error_message_if_only_one_rule", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [
        new AllowIf(async function First(_vc, _row) {
          return tester.respond("First", Error("wild"));
        }),
      ],
      insert: [],
    }),
    { id: "123", tenant_id: "42" }
  );
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [
        new AllowIf(async function First(_vc, _row) {
          return tester.respond("First", false);
        }),
      ],
      insert: [],
    }),
    { id: "123", tenant_id: "42" }
  );
});

test("0100_insert_fails_with_nice_error_message_if_only_one_rule", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [
        new AllowIf(async function First(_vc, _row) {
          return tester.respond("First", Error("wild"));
        }),
      ],
    }),
    { id: "123", tenant_id: "42" }
  );
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [
        new AllowIf(async function First(_vc, _row) {
          return tester.respond("First", false);
        }),
      ],
    }),
    { id: "123", tenant_id: "42" }
  );
});

test("0110_insert_succeeds_when_deny_if_rule_evaluates", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [],
      insert: [
        new DenyIf(async function First(_vc, _row) {
          return tester.respond("First", false);
        }),
        new AllowIf(new True()),
      ],
    }),
    { id: "123", tenant_id: "42" }
  );
});

test("0120_load_fails_when_deny_if_rule_throws", async () => {
  const tester = new ValidationTester();
  await tester.matchSnapshot(
    new Validation<typeof companyTable>("table", {
      load: [
        new DenyIf(async function First(vc, _row) {
          return tester.respond(
            "First",
            new EntNotReadableError(
              "other_table",
              vc.toString(),
              { id: "987" },
              { message: "ent access error" }
            )
          );
        }),
      ],
      insert: [],
    }),
    { id: "123", tenant_id: "42" }
  );
});

test("0130_fail_when_tenant_user_id_mismatches", async () => {
  const tester = new ValidationTester();
  const validation = new Validation<typeof companyTable>("table", {
    tenantPrincipalField: "tenant_id",
    load: [],
    insert: [],
  });
  await tester.matchSnapshot(
    validation,
    { id: "123", tenant_id: "42" },
    "validateLoad",
    undefined,
    vc.toLowerInternal("999")
  );
  await tester.matchSnapshot(
    validation,
    { id: "123", tenant_id: "42" },
    "validateInsert",
    undefined,
    vc.toLowerInternal("999")
  );
  await tester.matchSnapshot(
    validation,
    { id: "123" } as any,
    "validateInsert",
    undefined,
    vc.toLowerInternal("999")
  );
  await tester.matchSnapshot(
    validation,
    { id: "123", tenant_id: "42" },
    "validateUpdate",
    undefined,
    vc.toLowerInternal("999")
  );
  await tester.matchSnapshot(
    validation,
    { id: "123", tenant_id: "42" },
    "validateDelete",
    undefined,
    vc.toLowerInternal("999")
  );
});
