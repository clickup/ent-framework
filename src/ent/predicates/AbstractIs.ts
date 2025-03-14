import type { Predicate } from "./Predicate";

/**
 * A base interface for all user validation predicates.
 */
export interface AbstractIs<TRow> extends Predicate<TRow> {
  /** The field this validation predicate is related to (null means that it
   * applies to the entire Ent). */
  readonly field: string | null;
  /** In case the predicate returns false or doesn't provide error messages by
   * throwing EntValidationError, this message will be used. When message is
   * null, it means that we expect the validator to return detailed information
   * about each field errored (e.g. ValidatorStandardSchemaResult).  */
  readonly message: string | null;
}

/**
 * Result of plain validators.
 */
export type ValidatorPlainResult = boolean;

/**
 * Result of Zod safeParse() calls.
 */
export type ValidatorZodSafeParseResult =
  | {
      readonly success: true;
      readonly error?: undefined;
    }
  | {
      readonly success: false;
      readonly error: {
        readonly issues: ReadonlyArray<{
          readonly message: string;
          readonly path: readonly PropertyKey[];
        }>;
      };
    };

/**
 * Result of a Standard Schema validators: https://standardschema.dev/
 */
export type ValidatorStandardSchemaResult =
  | {
      readonly value: unknown;
      readonly issues?: undefined;
    }
  | {
      readonly issues: Array<{
        readonly message: string;
        readonly path?:
          | ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>
          | undefined;
      }>;
    };
