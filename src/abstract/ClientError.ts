import { copyStack } from "../helpers/misc";

/**
 * The suggested action, what can we do when facing this error.
 */
export type ClientErrorPostAction =
  | "rediscover" // re-run Shards/Islands discovery before retrying
  | "choose-another-client" // choose another replica, but don't rerun discovery
  | "fail"; // do not retry, fail immediately

/**
 * Sometimes we need to know for sure, is there a chance that the query failed,
 * but the write was still applied in the database.
 */
export type ClientErrorKind =
  | "data-on-server-is-unchanged"
  | "unknown-server-state";

/**
 * Encapsulates the error thrown when running a Client query. The object also
 * carries suggestions, what to do next.
 */
export class ClientError extends Error {
  constructor(
    public readonly cause:
      | null
      | undefined
      | { message?: unknown; stack?: unknown },
    where: string,
    public readonly postAction: ClientErrorPostAction,
    public readonly kind: ClientErrorKind,
    public readonly comment?: string
  ) {
    super(
      (typeof cause === "string" ? cause : cause?.message) +
        (comment ? `\n${comment}` : "")
    );

    Object.defineProperty(this, "name", {
      value: this.constructor.name,
      writable: true,
      enumerable: false,
    });

    if (typeof cause === "string") {
      this.cause = Error(cause);
    } else {
      copyStack(this, cause);
    }

    this.stack += `\n    on ${where}`;
    delete cause?.stack;
  }
}
