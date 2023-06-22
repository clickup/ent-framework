import { EntAccessError } from "./EntAccessError";

/**
 * Error: thrown when an Ent cannot be inserted due to privacy reasons.
 */
export class EntNotInsertableError extends EntAccessError {
  constructor(
    entName: string,
    public readonly vc: string,
    public readonly row: object,
    cause: string | { message: string } | null = null
  ) {
    super(entName, `${entName}: cannot insert in ${vc}`, cause);
  }
}
