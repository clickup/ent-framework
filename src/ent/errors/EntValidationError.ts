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
}

/**
 * Auxiliary information which every validation predicate should emit.
 */
export interface EntValidationErrorInfo {
  field: string | null; // it null, the message relates to the whole row
  message: string;
}
