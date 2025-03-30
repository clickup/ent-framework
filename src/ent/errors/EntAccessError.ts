import { copyStack, indent, inspectCompact } from "../../internal/misc";

/**
 * Standard Schema V1 compatible error result. Every EntAccessError can be
 * converted to it. See https://standardschema.dev.
 */
export interface StandardSchemaV1FailureResult {
  readonly issues: ReadonlyArray<{
    readonly message: string;
    readonly path?: readonly string[] | undefined;
  }>;
}

/**
 * A base class for errors that trigger the validation framework to process them
 * as a DENY/SKIP. Invariants in derived classes: the error message should be
 * safe to pass to the client (it must not have any private information; a good
 * example is EntValidationError), plus the message alone should be descriptive
 * enough to extract information from it. If `cause` is passed, it becomes a
 * part of the message, with the above assumptions.
 */
export class EntAccessError extends Error {
  public readonly cause: string | Error | null;

  constructor(
    public readonly entName: string,
    message: string,
    cause: unknown = null,
  ) {
    super(
      cause
        ? message.replace(/[,.?!:;]+$/s, "") +
            ", because:\n" +
            indent(causeToString(cause))
        : message,
    );

    Object.defineProperty(this, "name", {
      value: this.constructor.name,
      writable: true,
      enumerable: false,
    });

    if (cause instanceof Error) {
      this.cause = cause;
      copyStack(this, cause);
    } else {
      this.cause = cause ? causeToString(cause) : null;
    }
  }

  toStandardSchemaV1(): StandardSchemaV1FailureResult {
    return {
      issues: [
        this.entName
          ? { message: this.message, path: [this.entName] }
          : { message: this.message },
      ],
    };
  }
}

function causeToString(cause: unknown): string {
  // - Error is turned into its class name and the message (no stacktrace).
  // - String is left as it is.
  // - Any other object will be inspected in compact mode.
  return cause instanceof Error || typeof cause === "string"
    ? String(cause).trimEnd()
    : inspectCompact(cause);
}
