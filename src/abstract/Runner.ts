import type { QueryAnnotation } from "./QueryAnnotation";

const INIT_SEQUENCE = 3; // small prime, doesn't matter

/**
 * Knows how to translate individual strongly typed requests into DB language
 * (e.g. SQL, Redis etc.) and how to parse the result back.
 */
export abstract class Runner<TInput, TOutput> {
  /** If true, it's a write operation. */
  static readonly IS_WRITE: boolean;

  /** Used to build an unique default operation key. */
  private sequence = INIT_SEQUENCE;

  /** Operation name for logging purposes. */
  abstract readonly op: string;

  /** Maximum batch size for this type of operations. */
  abstract readonly maxBatchSize: number;

  /** In case undefined is returned from batching, this value will be returned
   * instead. */
  abstract readonly default: TOutput;

  /**
   * Method runSingle is to e.g. produce simple SQL requests when we have only
   * one input to process, not many.
   */
  abstract runSingle(
    input: TInput,
    annotations: QueryAnnotation[]
  ): Promise<TOutput | undefined>;

  /**
   * Typically issues complex queries with magic.
   */
  abstract runBatch?(
    inputs: Map<string, TInput>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, TOutput>>;

  /**
   * If the single query's error needs to be retried (e.g. it's a deadlock
   * error), returns the number of milliseconds to wait before retrying.
   */
  abstract delayForSingleQueryRetryOnError(
    error: unknown
  ): number | "immediate_retry" | "no_retry";

  /**
   * If this method returns true for an error object, the batch is split back
   * into sub-queries, they are executed individually, and then the response of
   * each query is delivered to each caller individually. Used mostly for e.g.
   * batch-deadlock errors or for FK constraint errors when it makes sense to
   * retry other members of the batch and not fail it entirely hurting other
   * innocent queries.
   *
   * We can do this, because we know that if some transaction is aborted, it's
   * always safe to retry it. (If we're not sure about the transaction, e.g. the
   * Client doesn't support transactions at all, then the method should return
   * false.)
   */
  abstract shouldDebatchOnError(error: unknown): boolean;

  /**
   * Parameter `name` is typically a table name.
   */
  constructor(public readonly name: string) {}

  /**
   * Returns a batch-dedupping key for the input. By default, no dedupping is
   * performed (i.e. all inputs are processed individually and not collapsed
   * into one input; e.g. this is needed for inserts).
   */
  key(_input: TInput): string {
    const key = "k" + this.sequence;
    this.sequence += INIT_SEQUENCE;
    if (this.sequence > INIT_SEQUENCE * 10000000) {
      this.sequence = INIT_SEQUENCE;
    }

    return key;
  }
}
