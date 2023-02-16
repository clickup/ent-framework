import type { TimelineCaughtUpReason } from "./Timeline";

/**
 * A reason why master or replica was chosen to send the query too. The most
 * noticeable ones are:
 * - "replica-bc-master-state-unknown": 99% of cases (since writes are rare)
 * - "master-bc-replica-not-caught-up": happens immediately after each write,
 *   until the write is propagated to replica
 * - "replica-bc-caught-up": must happen eventually (in 0.1-2s) after each write
 * - "replica-bc-pos-expired": signals that the replication lag is huge, we
 *   should carefully monitor this case and make sure it never happens
 */
export type WhyClient =
  | Exclude<TimelineCaughtUpReason, false>
  | "replica-bc-stale-replica-freshness"
  | "master-bc-is-write"
  | "master-bc-master-freshness"
  | "master-bc-no-replicas"
  | "master-bc-replica-not-caught-up";

/**
 * A debug annotation from each individual place which initiated the query. When
 * multiple queries are grouped into one large query by Ent Framework (even
 * cross-async-trace and cross-VC), the resulting large query is accompanied
 * with all those annotations.
 */
export interface QueryAnnotation {
  /** Trace ID of the series of the queries. */
  readonly trace: string;
  /** Something which identifies the acting user; it's named `vc` after Ent's VC
   * for simplicity, but at this layer of abstractions, there are no Ents. */
  readonly vc: string;
  /** Sometimes a query may be annotated by the source stack trace. It's
   * typically expensive, so it's likely "" in production. Non-empty string may
   * enable detailed SQL logging as well. */
  readonly debugStack: string;
  /** Answers, why exactly this client was selected to send the query to. */
  readonly whyClient: WhyClient | undefined;
  /** In case it's a retry, the attempt number will be greater than 0. */
  readonly attempt: number;
}
