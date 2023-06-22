import { inspect } from "util";
import { copyStack, indent } from "../../helpers/misc";

/**
 * A base class for errors which trigger the validation framework to process
 * them as a DENY/SKIP.
 */
export class EntAccessError extends Error {
  public readonly cause: string | Error | null;

  constructor(
    public readonly entName: string,
    message: string,
    cause: unknown = null
  ) {
    super(
      cause
        ? message.replace(/[,.?!:;]+$/s, "") +
            ", because:\n" +
            indent(causeToString(cause))
        : message
    );
    this.name = this.constructor.name; // https://javascript.info/custom-errors#further-inheritance
    if (cause instanceof Error) {
      this.cause = cause;
      copyStack(this, cause);
    } else {
      this.cause = cause ? causeToString(cause) : null;
    }
  }
}

function causeToString(cause: unknown): string {
  // - Error is turned into its class name and the message (no stacktrace).
  // - String is left as it is.
  // - Any other object will be inspected in compact mode.
  return cause instanceof Error || typeof cause === "string"
    ? String(cause).trimEnd()
    : inspect(cause, { compact: true, breakLength: Infinity });
}
