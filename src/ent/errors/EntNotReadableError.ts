import type { RowWithID } from "../../types";
import { ID } from "../../types";
import { EntAccessError } from "./EntAccessError";

/**
 * Error: thrown when an Ent cannot be read due to privacy reasons.
 */
export class EntNotReadableError extends EntAccessError {
  constructor(
    entName: string,
    public readonly vc: string,
    public readonly row: RowWithID,
    cause: string | { message: string } | null = null
  ) {
    super(entName, `${entName}:${row[ID]} is not readable in ${vc}`, cause);
  }
}
