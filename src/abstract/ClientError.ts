import type { MaybeError } from "../internal/misc";
import { addSentenceSuffixes, appendCause } from "../internal/misc";

/**
 * The suggested action, what can we do when facing a ClientError.
 */
export type ClientErrorPostAction =
  /** E.g. a Shard is relocated to another Island. We need to update the
   * Island-to-Shards mapping. Run Shards discovery on the entire Cluster before
   * retrying. */
  | "rediscover-cluster"
  /** E.g. a master node suddenly appears as replica (a switchover happened). We
   * don't want to rediscover ALL Islands, we only want to ping Clients of the
   * current Island (otherwise, we'd have a combinatorial explosion of
   * rediscovery requests everywhere if e.g. an Island with global shards
   * experiences an issue). Run shardNos() on all Clients of the current Island
   * before retrying. */
  | "rediscover-island"
  /** E.g. an attempt to use Client which is end()'ed: trigger a retry which
   * will choose another Client. This may happen when e.g. a Client instance is
   * returned to the Shards logic, and immediately after that it's been end()'ed
   * due to a rediscovery succeeding and recycling the old Clients. We can't
   * control the lifetime of Client instances returned to the caller (i.e. there
   * is always a chance that the caller will try to use the Client after it's
   * been end()'ed), but at least for Shards logic, we are able to retry. Choose
   * another (healthy) Client, but don't run rediscovery. */
  | "choose-another-client"
  /** Giving up on retries. Do not retry, fail immediately. */
  | "fail";

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
    public readonly cause: MaybeError,
    where: string,
    public readonly postAction: ClientErrorPostAction,
    public readonly kind: ClientErrorKind,
    public readonly abbreviation: string,
    public readonly comment?: string,
  ) {
    super(
      addSentenceSuffixes(
        typeof cause === "string" ? cause : `${cause?.message}`,
        ` (${abbreviation})`,
        comment ? `\n${comment}` : undefined,
      ),
    );

    Object.defineProperty(this, "name", {
      value: this.constructor.name,
      writable: true,
      enumerable: false,
    });

    if (typeof cause === "string") {
      this.cause = Error(cause);
    } else {
      appendCause(this, cause);
    }

    this.stack += `\n    on ${where}`;
    delete cause?.stack;
  }
}
