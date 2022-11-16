import { indent } from "../../helpers/misc";
import type { RowWithID } from "../../types";
import { ID } from "../../types";
import { EntAccessError } from "./EntAccessError";

/**
 * Error: thrown when an Ent cannot be updated or deleted due to privacy reasons.
 */
export class EntNotUpdatableError extends EntAccessError {
  constructor(
    public readonly entName: string,
    public readonly vc: string,
    public readonly row: RowWithID,
    public readonly cause: { message: string } | null = null
  ) {
    super(
      `${entName}:${row[ID]} is not updatable/deletable in ${vc}` +
        (cause ? ", because:\n" + indent(cause.message) : "")
    );
  }
}
