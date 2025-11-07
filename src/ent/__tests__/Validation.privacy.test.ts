import { PgSchema } from "../../pg/PgSchema";
import type { Row } from "../../types";
import { ID } from "../../types";
import { EntNotReadableError } from "../errors/EntNotReadableError";
import { Or } from "../predicates/Or";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { DenyIf } from "../rules/DenyIf";
import { Require } from "../rules/Require";
import { Validation } from "../Validation";
import { createVC, ValidationTester } from "./test-utils";

/* eslint-disable @typescript-eslint/no-unused-vars */
const companySchema = new PgSchema(
  'ent.validation"privacy"company',
  {
    id: { type: ID, autoInsert: "gen_id()" },
    tenant_id: { type: ID },
    name: { type: String, autoInsert: "''" },
  },
  [],
);

const vc = createVC();

test("0000: load succeeds when first rule allows", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
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
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateLoad",
      vc: vc.toLowerInternal("42"),
    }),
  ).toBe(true);
});

test("0010: load succeeds when any rule allows", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
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
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateLoad",
    }),
  ).toBe(true);
});

test("0020: load fails when first rule throws", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [
          new AllowIf(async function First(_vc, _row) {
            return tester.respond("First", Error("wild"));
          }),
        ],
        insert: [],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateLoad",
    }),
  ).toBe(false);
});

test("0030: insert succeeds when all require allow", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
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
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
      vc: vc.toLowerInternal("42"),
    }),
  ).toBe(true);
});

test("0040: insert fails when any require denies", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
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
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

test("0041: update fails when any require denies", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
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
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateUpdate",
      updateInput: {},
      vc: vc.toLowerInternal("42"),
    }),
  ).toBe(false);
});

test("0042: delete fails when any require denies", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
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
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateDelete",
      vc: vc.toLowerInternal("42"),
    }),
  ).toBe(false);
});

test("0050: insert fails when any require throws", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
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
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

test("0060: load succeeds when any rule allows even if another rule throws EntNotReadableError", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [
          new AllowIf(async function First(vc, _row) {
            return tester.respond(
              "First",
              // Not a "wild" exception (since derived from EntAccessError).
              new EntNotReadableError(
                "other_table",
                vc.toString(),
                { id: "987" },
                "ent access error",
              ),
            );
          }),
          new AllowIf(async function Second(_vc, _row) {
            return tester.respond("Second", true);
          }),
        ],
        insert: [],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateLoad",
    }),
  ).toBe(true);
});

test("0070: load fails when any rule allows but another rule throws any wild exception", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
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
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateLoad",
    }),
  ).toBe(false);
});

test("0080: validations fail when no rules defined", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [],
        insert: [],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateLoad",
    }),
  ).toBe(false);
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [],
        insert: [],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

test("0090: load fails with nice error message if only one rule", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [
          new AllowIf(async function First(_vc, _row) {
            return tester.respond("First", Error("wild"));
          }),
        ],
        insert: [],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateLoad",
    }),
  ).toBe(false);
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [
          new AllowIf(async function First(_vc, _row) {
            return tester.respond("First", false);
          }),
        ],
        insert: [],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateLoad",
    }),
  ).toBe(false);
});

test("0100: insert fails with nice error message if only one rule", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [],
        insert: [
          new Require(async function First(_vc, _row) {
            return tester.respond("First", Error("wild"));
          }),
        ],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [],
        insert: [
          new Require(async function First(_vc, _row) {
            return tester.respond("First", false);
          }),
        ],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

test("0110: insert succeeds when DenyIf rule evaluates", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [],
        insert: [
          new DenyIf(async function First(_vc, _row) {
            return tester.respond("First", false);
          }),
          new Require(new True()),
        ],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(true);
});

test("0120: load fails when DenyIf rule throws", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [
          new DenyIf(async function First(vc, _row) {
            return tester.respond(
              "First",
              new EntNotReadableError(
                "other_table",
                vc.toString(),
                { id: "987" },
                "ent access error",
              ),
            );
          }),
        ],
        insert: [],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateLoad",
    }),
  ).toBe(false);
});

test("0130: fail when tenant user id mismatches", async () => {
  const tester = new ValidationTester();
  const validation = new Validation<typeof companySchema.table>("table", {
    inferPrincipal: async (vc) => vc.toGuest(),
    tenantPrincipalField: "tenant_id",
    load: [],
    insert: [],
  });
  expect(
    await tester.matchSnapshot({
      validation,
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateLoad",
      vc: vc.toLowerInternal("999"),
    }),
  ).toBe(false);
  expect(
    await tester.matchSnapshot({
      validation,
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
      vc: vc.toLowerInternal("999"),
    }),
  ).toBe(false);
  expect(
    await tester.matchSnapshot({
      validation,
      row: { id: "123" } as Row<typeof companySchema.table>,
      method: "validateInsert",
      vc: vc.toLowerInternal("999"),
    }),
  ).toBe(false);
  expect(
    await tester.matchSnapshot({
      validation,
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateUpdate",
      updateInput: {},
      vc: vc.toLowerInternal("999"),
    }),
  ).toBe(false);
  expect(
    await tester.matchSnapshot({
      validation,
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateDelete",
      vc: vc.toLowerInternal("999"),
    }),
  ).toBe(false);
});

test("0140: load succeeds when some of Or predicates succeed", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [],
        insert: [
          new Require(
            new Or(
              async function First(_vc, _row) {
                return tester.respond(
                  "First",
                  new EntNotReadableError(
                    "other_table",
                    vc.toString(),
                    { id: "987" },
                    "ent access error",
                  ),
                );
              },
              async function Second(_vc, _row) {
                return tester.respond("Second", true);
              },
            ),
          ),
        ],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(true);
});

test("0150: load fails with nice error when all of Or predicates fail", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [],
        insert: [
          new Require(
            new Or(
              async function First(_vc, _row) {
                return tester.respond(
                  "First",
                  new EntNotReadableError(
                    "other_table",
                    vc.toString(),
                    { id: "987" },
                    { myKey: "ent access error" },
                  ),
                );
              },
              async function Second(_vc, _row) {
                return tester.respond("Second", false);
              },
            ),
          ),
        ],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

test("0160: load crashes when some predicates fail with a wild error", async () => {
  const tester = new ValidationTester();
  expect(
    await tester.matchSnapshot({
      validation: new Validation<typeof companySchema.table>("table", {
        inferPrincipal: async (vc) => vc.toGuest(),
        load: [],
        insert: [
          new Require(
            new Or(
              async function First(_vc, _row) {
                return tester.respond("First", Error("wild"));
              },
              async function Second(_vc, _row) {
                return tester.respond("Second", true);
              },
            ),
          ),
        ],
      }),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});
