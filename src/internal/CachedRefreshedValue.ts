import { Memoize } from "fast-typescript-memoize";
import type { DeferredPromise } from "p-defer";
import pDefer from "p-defer";
import type { MaybeCallable } from "./misc";
import { maybeCall, runInVoid } from "./misc";

export interface CachedRefreshedValueOptions<TValue> {
  /** Delay between calling resolver. */
  delayMs: MaybeCallable<number>;
  /** Log a timeout Error if a resolver takes more than X ms to complete. */
  warningTimeoutMs: MaybeCallable<number>;
  /** The handler deps.handler() is called every deps.delayMs (typically,
   * frequently); if it returns a different value than previously (using "==="
   * comparison), then waiting for the next delayMs is interrupted prematurely,
   * and the value gets refreshed. This allows to frequently recheck for some
   * configuration changes and act accordingly. */
  deps: {
    delayMs: MaybeCallable<number>;
    handler: () => unknown | Promise<unknown>;
  };
  /** The name of the resolverFn function. Used in error messages. */
  resolverName?: string;
  /** A resolver function that returns the value. It's assumed that this
   * function would eventually either resolve or throw. */
  resolverFn: () => Promise<TValue>;
  /** An error handler. */
  onError: (error: unknown, elapsed: number) => void;
  /** A custom delay implementation. */
  delay: (ms: number) => Promise<void>;
}

/**
 * Utility class to provide a caching layer for a resolverFn with the following
 * assumptions:
 * - The value is stable and does not change frequently.
 * - The resolverFn can throw or take more time to resolve (e.g. outage). In
 *   that case, the cached value is still valid, unless a fresh value is
 *   requested with refreshAndWait().
 *
 * The implementation is as follows:
 * - Once value is accessed, we schedule an endless loop of calling resolver to
 *   get latest value.
 * - The result is cached, so next calls will return it immediately in most of
 *   the cases.
 * - Once every delayMs we call resolverFn to get latest value. All calls during
 *   this time will get previous value (if available).
 */
export class CachedRefreshedValue<TValue> {
  /** Latest value pulled from the cache. */
  private latestValue: TValue | null = null;
  /** Deferred promise containing the next value. Fulfilled promises are
   * replaced right away. */
  private nextValue: DeferredPromise<TValue> = pDefer<TValue>();
  /** Each time before resolverFn() is called, this value is increased. */
  private resolverFnCallCount: number = 0;
  /** Whether the instance is destroyed or not. Used to prevent memory leaks in
   * unit tests. */
  private destroyedError: Error | null = null;
  /** A callback to skip the current delay() call. */
  private skipDelay: (() => void) | null = null;

  /**
   * Initializes the instance.
   */
  constructor(public readonly options: CachedRefreshedValueOptions<TValue>) {}

  /**
   * Returns latest cached value. If the value has been calculated at least
   * once, then it is guaranteed that in the worst case, it will be returned
   * immediately. I.e. this method never blocks once at least one calculation
   * succeeded in the past. (But it may block during the very first call.)
   */
  async cached(): Promise<TValue> {
    runInVoid(this.refreshLoop());
    return this.latestValue ?? this.nextValue.promise;
  }

  /**
   * Triggers the call to resolverFn() ASAP (i.e. sooner than the next interval
   * specified in delayMs) and waits for the next complete SUCCESSFUL cache
   * refresh. If the method is called during the period of time when the
   * resolverFn() is already running, then it waits till it finishes, and then
   * waits again till the next resolverFn() call finishes, so we're sure that
   * it's a strong barrier.
   */
  async refreshAndWait(): Promise<void> {
    runInVoid(this.refreshLoop());
    // To unfreeze, we want a completely new resolverFn() call to finish within
    // refreshLoop(). I.e. the call to resolverFn() must start strictly AFTER we
    // entered refreshAndWait(); thus, `while` loop below may spin twice.
    const startCallCount = this.resolverFnCallCount;
    while (this.resolverFnCallCount <= startCallCount) {
      // Skip waiting between loops.
      this.skipDelay?.();
      // After await resolves here, it's guaranteed that this.nextValue will be
      // reassigned with a new pDefer, and this.latestValue will be updated (see
      // refreshLoop() body).
      await this.nextValue.promise;
    }
  }

  /**
   * Destroys the instance. Stops refreshing the value and any call to it will
   * result in an error.
   */
  destroy(): void {
    this.destroyedError = Error(
      `${this.constructor.name}: This instance is destroyed`,
    );
  }

  @Memoize()
  private async refreshLoop(): Promise<void> {
    while (!this.destroyedError) {
      const warningDelayMs = maybeCall(this.options.warningTimeoutMs);
      const depsDelayMs = maybeCall(this.options.deps.delayMs);
      const startTime = performance.now();

      const warningTimeout = setTimeout(
        () =>
          this.onError(
            Error(
              `${this.constructor.name}.refreshLoop: Warning: ` +
                `${this.options.resolverName ?? "resolverFn"}() did not complete in ${warningDelayMs} ms!`,
            ),
            Math.round(performance.now() - startTime),
          ),
        warningDelayMs,
      ).unref();

      let depsPrev: unknown = undefined;
      try {
        this.resolverFnCallCount++;
        depsPrev = await this.options.deps.handler();
        this.latestValue = await this.options.resolverFn();
        const oldNextValue = this.nextValue;
        this.nextValue = pDefer();
        oldNextValue.resolve(this.latestValue);
      } catch (e: unknown) {
        this.onError(e, Math.round(performance.now() - startTime));
      } finally {
        clearTimeout(warningTimeout);
      }

      // Wait for delayMs. If this.skipDelay() is called, the code unfreezes
      // immediately. Also, deps are rechecked every depsDelayMs, and if they
      // change, the code unfreezes too.
      const delayDefer = pDefer<void>();
      this.skipDelay = () => delayDefer.resolve();

      let depsTimeoutBody: null | (() => void) = () =>
        runInVoid(async () => {
          try {
            const depsCurr = await this.options.deps.handler();
            if (depsCurr !== depsPrev) {
              delayDefer.resolve();
            }
          } catch (e: unknown) {
            this.onError(e, Math.round(performance.now() - startTime));
          } finally {
            if (depsTimeoutBody) {
              depsTimeout = setTimeout(depsTimeoutBody, depsDelayMs).unref();
            }
          }
        });

      let depsTimeout =
        depsPrev !== undefined
          ? setTimeout(depsTimeoutBody, depsDelayMs).unref()
          : undefined;
      try {
        this.options
          .delay(maybeCall(this.options.delayMs))
          .finally(() => delayDefer.resolve());
        await delayDefer.promise;
      } finally {
        depsTimeoutBody = null;
        clearTimeout(depsTimeout);
      }
    }

    // Mark current instance as destroyed.
    this.latestValue = null;
    runInVoid(
      this.nextValue.promise.catch(() => {
        // Stops unhandled promise rejection errors.
      }),
    );
    this.nextValue.reject(this.destroyedError);
  }

  /**
   * A never throwing version of options.onError().
   */
  private onError(...args: Parameters<(typeof this.options)["onError"]>): void {
    try {
      this.options.onError(...args);
    } catch {
      // noop
    }
  }
}
