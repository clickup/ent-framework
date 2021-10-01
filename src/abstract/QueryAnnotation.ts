/**
 * A debug annotation of an object which runs a query.
 */
export interface QueryAnnotation {
  /** Trace ID of the series of the queries. */
  readonly trace: string;
  /** Something which identifies the acting user; it's named `vc` after Ent's VC
   * for simplicity, but at this layer of abstractions, there are no Ents. */
  readonly vc: string;
  /** Sometimes a query may be annotated by the source stack trace. It's
   * typically expensive, so it's likely "" in production. */
  readonly debugStack: string;
}
