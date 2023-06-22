import { indent } from "../../helpers/misc";

/**
 * A base class for errors which trigger the validation framework to process
 * them as a DENY/SKIP.
 */
export class EntAccessError extends Error {
  constructor(
    public readonly entName: string,
    message: string,
    public readonly cause: string | { message: string } | null = null
  ) {
    super(
      cause
        ? message.replace(/[,.?!:;]+$/s, "") +
            ", because:\n" +
            indent(typeof cause === "string" ? cause : cause.message)
        : message
    );
    this.name = this.constructor.name; // https://javascript.info/custom-errors#further-inheritance
  }
}
