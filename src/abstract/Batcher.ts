import delay from "delay";
import type { DeferredPromise } from "p-defer";
import pDefer from "p-defer";
import { DefaultMap } from "../internal/DefaultMap";
import type { MaybeCallable } from "../internal/misc";
import { appendCaller, maybeCall, runInVoid } from "../internal/misc";
import type { QueryAnnotation } from "./QueryAnnotation";
import type { Runner } from "./Runner";

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

  protected flushQueue = async (): Promise<void> => {
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
    const errors = new Map<string, unknown>();

    if (inputs.size === 1 || !this.runner.runBatch || this.disableBatching) {
      // Relatively rare since most of the requests come batched.
      await this.runSingleForEach(inputs, annotations, outputs, errors);
    } else {
      // Called most of the times.
      try {
        outputs = await this.runner.runBatch(inputs, annotations);
      } catch (e: unknown) {
        // Relatively rare under heavy load (since errors are rare).
        if (this.runner.shouldDebatchOnError(e)) {
          await this.runSingleForEach(
            inputs,
            incrementAttempt(annotations),
            outputs,
            errors,
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
        for (const defer of defersOfKey) {
          // There are typically multiple callers waiting for the query results
          // (due to e.g. same-ID queries coalescing).
          defer.resolve(outputOrDefault);
        }
      } else {
        for (const defer of defersOfKey) {
          defer.reject(error);
        }
      }
    }
  };

  constructor(
    private runner: Runner<TInput, TOutput>,
    private batchDelayMs: MaybeCallable<number>,
    private disableBatching: boolean,
  ) {}

  async run(input: TInput, annotation: QueryAnnotation): Promise<TOutput> {
    const key = this.runner.key(input);
    const delay = maybeCall(this.batchDelayMs);

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
      annotation,
    );

    if (
      this.queuedInputs.size >= this.runner.maxBatchSize ||
      !this.runner.runBatch ||
      this.disableBatching
    ) {
      runInVoid(this.flushQueue);
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
        Promise.resolve().then(() =>
          delay > 0
            ? setTimeout(() => runInVoid(this.flushQueue()), delay)
            : process.nextTick(this.flushQueue),
        ),
      );
    }

    return defer.promise.catch((e: unknown) => {
      throw appendCaller(e);
    }) as Promise<TOutput>;
  }

  private async runSingleForEach(
    inputs: Map<string, TInput>,
    annotations: QueryAnnotation[],
    outOutputs: Map<string, TOutput | undefined>,
    outErrors: Map<string, unknown>,
  ): Promise<void> {
    const promises: Array<Promise<unknown>> = [];
    for (const [key, input] of inputs) {
      promises.push(
        this.runner
          .runSingle(input, annotations)
          .catch(async (error: unknown) => {
            const retryMs = this.runner.delayForSingleQueryRetryOnError(error);

            if (typeof retryMs === "number") {
              await delay(retryMs);
            }

            if (retryMs !== "no_retry") {
              return this.runner.runSingle(
                input,
                incrementAttempt(annotations),
              );
            }

            throw error;
          })
          .then((output) => outOutputs.set(key, output))
          .catch((error: unknown) => outErrors.set(key, error)),
      );
    }

    await Promise["all"](promises);
  }
}

function incrementAttempt(annotations: QueryAnnotation[]): QueryAnnotation[] {
  return annotations.map((a) => ({ ...a, attempt: a.attempt + 1 }));
}
