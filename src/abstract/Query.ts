import type { Client } from "./Client";
import type { QueryAnnotation } from "./QueryAnnotation";

/**
 * A very lean interface for a Query. In practice each query is so different
 * that this interface is the only common part of them all.
 */
export interface Query<TOutput> {
  readonly IS_WRITE: boolean;
  run(client: Client, annotation: QueryAnnotation): Promise<TOutput>;
}
