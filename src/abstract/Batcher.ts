import delay from "delay";
import type { DeferredPromise } from "p-defer";
import pDefer from "p-defer";
import { DefaultMap } from "../helpers/DefaultMap";
import { runInVoid } from "../helpers/misc";
import type { QueryAnnotation } from "./QueryAnnotation";

export const DEFAULT_MAX_BATCH_SIZE = 100;

const RESOLVED_PROMISE = Promise.resolve();
const INIT_SEQUENCE = 3; // small prime, doesn't matter

/**
 * Knows how to translate individual strongly typed requests into DB language
 * (e.g. SQL, Redis etc.) and how to parse the result back.
 */
export abstract class Runner<TInput, TOutput> {
  /**
   * If true, it's a write operation.
   */
  static readonly IS_WRITE: boolean;

  private sequence = INIT_SEQUENCE;

  /**
   * Maximum batch size for this type of operations.
   */
  readonly maxBatchSize: number = DEFAULT_MAX_BATCH_SIZE;

  /**
   * In case undefined is returned from batching, this value will be returned
   * instead.
   */
  abstract readonly default: TOutput;

  /**
   * Name of the shard for this runner.
   */
  abstract readonly shardName: string;

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
    error: any
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
   * client doesn't support transactions at all, then the method should return
   * false.)
   */
  abstract shouldDebatchOnError(error: any): boolean;

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

/**
 * Batcher is similar to DataLoader, but with a few important differences:
 * 1. It's strongly typed not only for the output, but for input too. And input
 *    can be arbitrary, not only strings (e.g. rows).
 * 2. It does requests dedupping for all queries (including selects).
 * 3. It's not limited by read-only requests like DataLoader, and thus it
 *    doesn't to any caching. Caching is delegated to some other layer (either
 *    above Batcher or in Runner).
 */
export class Batcher<TInput, TOutput> {
  // key -> input
  private queuedInputs = new Map<string, TInput>();

  // key -> DeferredPromise[]
  private queuedDefers = new DefaultMap<
    string,
    Array<DeferredPromise<TOutput>>
  >();

  // Dedupped annotations; each annotation identifies a caller of the query.
  private queuedAnnotations = new Map<string, QueryAnnotation>();

  private batchDelayMs: () => number;

  protected flushQueue = async () => {
    if (!this.queuedInputs.size) {
      return;
    }

    const inputs = this.queuedInputs;
    const defers = this.queuedDefers;
    const annotations = [...this.queuedAnnotations.values()];
    this.queuedInputs = new Map();
    this.queuedDefers = new DefaultMap();
    this.queuedAnnotations = new Map();

    let outputs = new Map<string, TOutput | undefined>();
    const errors = new Map<string, any>();

    if (inputs.size === 1 || !this.runner.runBatch) {
      // Relatively rare since most of the requests come batched.
      await this.runSingleForEach(inputs, annotations, outputs, errors);
    } else {
      try {
        // Called most of the times.
        outputs = await this.runner.runBatch(inputs, annotations);
      } catch (e: any) {
        // Relatively rare under heavy load (since errors are rare).
        if (this.runner.shouldDebatchOnError(e)) {
          await this.runSingleForEach(
            inputs,
            incrementAttempt(annotations),
            outputs,
            errors
          );
        } else {
          for (const key of defers.keys()) {
            errors.set(key, e);
          }
        }
      }
    }

    for (const [key, defersOfKey] of defers.entries()) {
      const error = errors.get(key);
      const output = outputs.get(key);
      if (error === undefined) {
        const outputOrDefault =
          output === undefined ? this.runner.default : output;
        for (const { resolve } of defersOfKey) {
          // There are typically multiple callers waiting for the query results
          // (due to e.g. same-ID queries coalescing).
          resolve(outputOrDefault);
        }
      } else {
        for (const { reject } of defersOfKey) {
          reject(error);
        }
      }
    }
  };

  constructor(
    private runner: Runner<TInput, TOutput>,
    private maxBatchSize: number = 0,
    batchDelayMs: number | (() => number) = 0
  ) {
    if (!this.maxBatchSize) {
      this.maxBatchSize = runner.maxBatchSize;
    }

    this.batchDelayMs =
      typeof batchDelayMs === "number" ? () => batchDelayMs : batchDelayMs;
  }

  async run(input: TInput, annotation: QueryAnnotation): Promise<TOutput> {
    const key = this.runner.key(input);
    const delay = this.batchDelayMs();

    // Queue return promise of this method.
    const defer = pDefer<TOutput>();
    this.queuedDefers.getOrAdd(key, Array).push(defer);

    // In case of dedupping by key, prefer the last value. E.g. if 2 UPDATEs
    // for the same ID have different values, then the last one will win, not
    // the 1st one.
    this.queuedInputs.set(key, input);

    // Annotations are dedupped by their content.
    this.queuedAnnotations.set(
      annotation.trace +
        annotation.vc +
        annotation.debugStack +
        annotation.whyClient,
      annotation
    );

    if (this.queuedInputs.size >= this.maxBatchSize) {
      runInVoid(RESOLVED_PROMISE.then(this.flushQueue));
    } else if (this.queuedInputs.size === 1) {
      // Defer calling of flushQueue() to the "end of the event loop's spin", to
      // have a chance to collect more run() calls for it to execute. We
      // actually defer twice (to the end of microtasks sub-loop and then once
      // again), just in case: the original DataLoader library wraps the
      // nextTick() call into a "global resolved Promise" object, so we do the
      // same here blindly. See some of details here:
      // https://github.com/graphql/dataloader/blob/fae38f14702e925d1e59051d7e5cb3a9a78bfde8/src/index.js#L234-L241
      // https://stackoverflow.com/a/27648394
      runInVoid(
        RESOLVED_PROMISE.then(() =>
          delay > 0
            ? setTimeout(() => runInVoid(this.flushQueue()), delay)
            : process.nextTick(this.flushQueue)
        )
      );
    }

    return defer.promise;
  }

  private async runSingleForEach(
    inputs: Map<string, TInput>,
    annotations: QueryAnnotation[],
    outOutputs: Map<string, TOutput | undefined>,
    outErrors: Map<string, any>
  ) {
    const promises: Array<Promise<unknown>> = [];
    for (const [key, input] of inputs) {
      promises.push(
        this.runner
          .runSingle(input, annotations)
          .catch(async (error) => {
            const retryMs = this.runner.delayForSingleQueryRetryOnError(error);

            if (typeof retryMs === "number") {
              await delay(retryMs);
            }

            if (retryMs !== "no_retry") {
              return this.runner.runSingle(
                input,
                incrementAttempt(annotations)
              );
            }

            throw error;
          })
          .then((output) => outOutputs.set(key, output))
          .catch((error) => outErrors.set(key, error))
      );
    }

    return Promise["all"](promises);
  }
}

function incrementAttempt(annotations: QueryAnnotation[]) {
  return annotations.map((a) => ({ ...a, attempt: a.attempt + 1 }));
}
