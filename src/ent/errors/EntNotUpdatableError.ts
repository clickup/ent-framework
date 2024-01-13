import type { RowWithID } from "../../types";
import { ID } from "../../types";
import { EntAccessError } from "./EntAccessError";

/**
 * Error: thrown when an Ent cannot be updated or deleted due to privacy reasons.
 */
export class EntNotUpdatableError extends EntAccessError {
  constructor(
    entName: string,
    public readonly vc: string,
    public readonly row: RowWithID,
    cause: unknown = null,
  ) {
    super(
      entName,
      `${entName}:${row[ID]} is not updatable/deletable in ${vc}`,
      cause,
    );
  }
}
