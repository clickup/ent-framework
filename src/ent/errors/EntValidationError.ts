import type { StandardSchemaV1FailureResult } from "./EntAccessError";
import { EntAccessError } from "./EntAccessError";

/**
 * Error: thrown after all validators are executed, and some of them think that
 * the row is invalid.
 */
export class EntValidationError extends EntAccessError {
  constructor(
    entName: string,
    public readonly errors: readonly EntValidationErrorInfo[],
  ) {
    super(
      entName,
      // The below string is just for debugging purposes.
      `${entName}: ` +
        errors
          .map((error) => error.field + ": " + JSON.stringify(error.message))
          .join(", "),
    );
  }

  /**
   * Converts the payload to a Standard Schema V1 compatible error result. See
   * https://standardschema.dev.
   */
  override toStandardSchemaV1(): StandardSchemaV1FailureResult {
    return {
      issues: this.errors.map(({ field, message }) => ({
        message,
        path:
          this.entName || field !== null
            ? [
                ...(this.entName ? [this.entName] : []),
                ...(field !== null ? [field] : []),
              ]
            : undefined,
      })),
    };
  }
}

/**
 * Auxiliary information which every validation predicate should emit.
 */
export interface EntValidationErrorInfo {
  field: string | null; // it null, the message relates to the whole row
  message: string;
}
