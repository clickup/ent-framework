import { indent } from "../../helpers/misc";
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
    public readonly cause: { message: string } | null = null
  ) {
    super(
      entName,
      `${entName}:${row[ID]} is not readable in ${vc}` +
        (cause ? ", because:\n" + indent(cause.message) : "")
    );
  }
}
