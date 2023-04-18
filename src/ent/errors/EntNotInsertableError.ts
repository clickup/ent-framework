import { indent } from "../../helpers/misc";
import { EntAccessError } from "./EntAccessError";

/**
 * Error: thrown when an Ent cannot be inserted due to privacy reasons.
 */
export class EntNotInsertableError extends EntAccessError {
  constructor(
    entName: string,
    public readonly vc: string,
    public readonly row: object,
    public readonly cause: string | { message: string } | null = null
  ) {
    super(
      entName,
      `${entName}: cannot insert in ${vc}` +
        (cause
          ? ", because:\n" +
            indent(typeof cause === "string" ? cause : cause.message)
          : "")
    );
  }
}
