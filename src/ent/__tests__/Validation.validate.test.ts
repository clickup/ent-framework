import { EntNotFoundError, EntValidationError } from "..";
import { PgSchema } from "../../pg/PgSchema";
import { ID } from "../../types";
import type {
  ValidatorStandardSchemaResult,
  ValidatorZodSafeParseResult,
} from "../predicates/AbstractIs";
import { FieldIs } from "../predicates/FieldIs";
import { RowIs } from "../predicates/RowIs";
import { True } from "../predicates/True";
import { Require } from "../rules/Require";
import type { ValidationRules } from "../Validation";
import { Validation } from "../Validation";
import { ValidationTester } from "./test-utils";

const companySchema = new PgSchema(
  'ent.validation"validate"company',
  {
    id: { type: ID, autoInsert: "gen_id()" },
    tenant_id: { type: ID },
    name: { type: String, autoInsert: "''" },
  },
  [],
);

let tester: ValidationTester;

beforeEach(() => {
  tester = new ValidationTester();
});

test("0010: update fails when field validation fails", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new FieldIs(
          "tenant_id",
          (value, row) =>
            tester.respond("FieldIs(tenant_id)", false, [value, row]),
          "some one",
        ),
        new FieldIs(
          "tenant_id",
          (value, row) =>
            tester.respond("FieldIs(tenant_id)", false, [value, row]),
          "some two",
        ),
        new FieldIs("name", async (value, row) =>
          tester.respond(
            "FieldIs(tenant_id)",
            standardSchemaIssuesAsync("name", "boom"),
            [value, row],
          ),
        ),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateUpdate",
      updateInput: { tenant_id: "42", name: "hi" },
    }),
  ).toBe(false);
});

test("0020: update succeeds when validation fails, but the field is untouched", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new FieldIs(
          "name",
          (value, row) => tester.respond("FieldIs(name)", false, [value, row]),
          "boom",
        ),
        new FieldIs("name", async (value, row) =>
          tester.respond(
            "FieldIs(name)",
            standardSchemaIssues("name", "boom"),
            [value, row],
          ),
        ),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateUpdate",
      updateInput: { tenant_id: "101" },
    }),
  ).toBe(true);
});

test("0030: insert succeeds when multiple validators succeed", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new RowIs(
          (row) => tester.respond("RowIs", true, row),
          "always succeeds",
        ),
        new RowIs((row) => tester.respond("RowIs", zodSuccess(), row)),
        new FieldIs(
          "name",
          (value, row) => tester.respond("FieldIs(name)", true, [value, row]),
          "always succeeds",
        ),
        new FieldIs("name", async (value, row) =>
          tester.respond("FieldIs(name)", standardSchemaSuccess(), [
            value,
            row,
          ]),
        ),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(true);
});

test("0040: insert fails when field validation fails", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new FieldIs(
          "name",
          (value, row) => tester.respond("FieldIs(name)", false, [value, row]),
          "boom",
        ),
        new FieldIs("name", async (value, row) =>
          tester.respond("FieldIs(name)", zodIssues("name", "boom"), [
            value,
            row,
          ]),
        ),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

test("0050: update fails when RowIs fails", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new RowIs((row) => tester.respond("RowIs", false, row), "boom"),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateUpdate",
      updateInput: {},
    }),
  ).toBe(false);
});

test("0060: update fails when RowIs fails, and RowIs propagates field name", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new RowIs((row) =>
          tester.respond("RowIs", zodIssues("name", "boom"), row),
        ),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateUpdate",
      updateInput: { name: "hi" },
    }),
  ).toBe(false);
});

test("0070: update succeeds when RowIs fails, but the field it propagates is untouched", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new RowIs((row) =>
          tester.respond("RowIs", standardSchemaIssues("name", "boom"), row),
        ),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateUpdate",
      updateInput: {},
    }),
  ).toBe(true);
});

test("0080: insert fails when RowIs fails", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new RowIs((row) => tester.respond("RowIs", false, row), "boom"),
        new RowIs((row) =>
          tester.respond("RowIs", zodIssues("name", "boom"), row),
        ),
        new RowIs((row) =>
          tester.respond(
            "RowIs",
            zodIssues(null, "Expected object, received number"),
            row,
          ),
        ),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

test("0090: insert throws when FieldIs throws a weird error", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new FieldIs(
          "name",
          (value, row) =>
            tester.respond("FieldIs", Error("ouch"), [value, row]),
          "boom",
        ),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

test("0095: insert fails on EntNotFoundError in FieldIs", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new FieldIs(
          "name",
          (value, row) =>
            tester.respond(
              "FieldIs",
              new EntNotFoundError("MyEnt", { id: "42" }),
              [value, row],
            ),
          "boom",
        ),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

test("0096: insert fails on manual EntValidationError in RowIs", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new RowIs(
          (row) =>
            tester.respond(
              "RowIs",
              new EntValidationError("MyEnt", [
                { field: "name", message: "huh" },
              ]),
              row,
            ),
          "boom",
        ),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

test("0100: insert throws when RowIs throws a weird error", async () => {
  expect(
    await tester.matchSnapshot({
      validation: createValidation([
        new RowIs((row) => tester.respond("RowIs", Error("ouch"), row), "boom"),
      ]),
      row: { id: "123", tenant_id: "42", name: "hi" },
      method: "validateInsert",
    }),
  ).toBe(false);
});

function createValidation(
  validate: ValidationRules<typeof companySchema.table>["validate"],
): Validation<typeof companySchema.table> {
  return new Validation<typeof companySchema.table>("table", {
    inferPrincipal: async (vc) => vc.toGuest(),
    load: [],
    insert: [new Require(new True())],
    validate,
  });
}

function zodSuccess(): ValidatorZodSafeParseResult {
  return { success: true };
}

function zodIssues(
  field: string | null,
  message: string,
): ValidatorZodSafeParseResult {
  return {
    success: false,
    error: { issues: [{ message, path: field ? [field] : [] }] },
  };
}

function standardSchemaSuccess(): ValidatorStandardSchemaResult {
  return { value: 42 };
}

function standardSchemaIssues(
  field: string,
  message: string,
): ValidatorStandardSchemaResult {
  return { issues: [{ message, path: [field] }] };
}

async function standardSchemaIssuesAsync(
  field: string,
  message: string,
): Promise<ValidatorStandardSchemaResult> {
  return standardSchemaIssues(field, message);
}
