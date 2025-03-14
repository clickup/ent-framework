import type { VC } from "../VC";
import type {
  AbstractIs,
  ValidatorPlainResult,
  ValidatorStandardSchemaResult,
  ValidatorZodSafeParseResult,
} from "./AbstractIs";
import { maybeThrowEntValidationError } from "./internal/maybeThrowEntValidationError";

/**
 * A field validator function that returns a boolean.
 */
export type FieldIsValidatorPlain<
  TField extends string,
  TRow extends Partial<Record<TField, unknown>>,
> = (
  fieldValue: TRow[TField],
  row: TRow,
  vc: VC,
) => ValidatorPlainResult | Promise<ValidatorPlainResult>;

/**
 * A field validator function that returns a Zod result.
 */
export type FieldIsValidatorZodSafeParse<TRow> = (
  fieldValue: unknown,
  row: TRow,
  vc: VC,
) => ValidatorZodSafeParseResult | Promise<ValidatorZodSafeParseResult>;

/**
 * A field validator function that returns a Standard Schema validation result.
 */
export type FieldIsValidatorStandardSchemaV1<TRow> = (
  fieldValue: unknown,
  row: TRow,
  vc: VC,
) => ValidatorStandardSchemaResult | Promise<ValidatorStandardSchemaResult>;

/**
 * Checks that the validator function returns true for the value in some field.
 */
export class FieldIs<
  TField extends string,
  TRow extends Partial<Record<TField, unknown>>,
> implements AbstractIs<TRow>
{
  readonly name;
  readonly field: TField;
  readonly message: string | null;
  readonly validator;

  /**
   * Manual validator. Implies that we can trust the fieldValue TS type.
   */
  constructor(
    field: TField,
    validator: FieldIsValidatorPlain<TField, TRow>,
    message: string,
  );

  /**
   * Rich validator, like Standard Schema (https://standardschema.dev) or Zod.
   * No implications are made on the fieldValue type.
   */
  constructor(
    field: TField,
    validator:
      | FieldIsValidatorStandardSchemaV1<TRow>
      | FieldIsValidatorZodSafeParse<TRow>,
  );

  constructor(
    field: TField,
    validator:
      | FieldIsValidatorPlain<TField, TRow>
      | FieldIsValidatorZodSafeParse<TRow>
      | FieldIsValidatorStandardSchemaV1<TRow>,
    message?: string,
  ) {
    this.name = this.constructor.name + "(" + field + ")";
    this.field = field;
    this.message = message ?? null;
    this.validator = validator;
  }

  /**
   * Returns true if validation succeeds. Returns false if it wants the client
   * to use this.message as a validation failure response. Throws an instance of
   * EntValidationError when it needs to deliver the detailed error messages
   * about multiple fields.
   */
  async check(vc: VC, row: TRow): Promise<boolean> {
    const res = await this.validator(row[this.field], row, vc);
    return maybeThrowEntValidationError({
      name: this.name,
      field: this.field,
      res,
      allowRichResult: this.message === null,
    });
  }
}
