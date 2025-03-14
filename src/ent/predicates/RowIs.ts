import type { VC } from "../VC";
import type {
  AbstractIs,
  ValidatorPlainResult,
  ValidatorStandardSchemaResult,
  ValidatorZodSafeParseResult,
} from "./AbstractIs";
import { maybeThrowEntValidationError } from "./internal/maybeThrowEntValidationError";

/**
 * A row validator function that returns a boolean.
 */
export type RowIsValidatorPlain<TRow> = (
  row: TRow,
  vc: VC,
) => ValidatorPlainResult | Promise<ValidatorPlainResult>;

/**
 * A row validator function that returns a Zod result.
 */
export type RowIsValidatorZodSafeParse<TRow> = (
  row: TRow,
  vc: VC,
) => ValidatorZodSafeParseResult | Promise<ValidatorZodSafeParseResult>;

/**
 * A row validator function that returns a Standard Schema validation result.
 */
export type RowIsValidatorStandardSchemaV1<TRow> = (
  row: TRow,
  vc: VC,
) => ValidatorStandardSchemaResult | Promise<ValidatorStandardSchemaResult>;

/**
 * Checks that the validator function returns true for the entire row.
 */
export class RowIs<TRow> implements AbstractIs<TRow> {
  readonly name;
  readonly field = null;
  readonly message: string | null;
  readonly validator;

  /**
   * Manual validator.
   */
  constructor(validator: RowIsValidatorPlain<TRow>, message: string);

  /**
   * Rich validator, like Standard Schema (https://standardschema.dev) or Zod.
   */
  constructor(
    validator:
      | RowIsValidatorZodSafeParse<TRow>
      | RowIsValidatorStandardSchemaV1<TRow>,
  );

  constructor(
    validator:
      | RowIsValidatorPlain<TRow>
      | RowIsValidatorZodSafeParse<TRow>
      | RowIsValidatorStandardSchemaV1<TRow>,
    message?: string,
  ) {
    this.name = this.constructor.name;
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
    const res = await this.validator(row, vc);
    return maybeThrowEntValidationError({
      name: this.name,
      field: null,
      res,
      allowRichResult: this.message === null,
    });
  }
}
