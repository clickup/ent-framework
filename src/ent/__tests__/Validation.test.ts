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

test("0000: load succeeds when first rule allows", async () => {
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

test("0010: load succeeds when any rule allows", async () => {
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

test("0020: load fails when first rule throws", async () => {
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

test("0030: insert succeeds when all require allow", async () => {
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

test("0040: insert fails when any require denies", async () => {
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

test("0041: update fails when any require denies", async () => {
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

test("0042: delete fails when any require denies", async () => {
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

test("0043: update fails when user errors", async () => {
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

test("0044: update succeeds user validation when field untouched", async () => {
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

test("0050: insert fails when any require throws", async () => {
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

test("0060: load succeeds when any rule allows even if another rule throws EntNotReadableError", async () => {
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

test("0070: load fails when any rule allows but another rule throws any wild exception", async () => {
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

test("0080: validations fail when no rules defined", async () => {
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

test("0090: load fails with nice error message if only one rule", async () => {
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

test("0100: insert fails with nice error message if only one rule", async () => {
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

test("0110: insert succeeds when DenyIf rule evaluates", async () => {
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

test("0120: load fails when DenyIf rule throws", async () => {
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

test("0130: fail when tenant user id mismatches", async () => {
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
