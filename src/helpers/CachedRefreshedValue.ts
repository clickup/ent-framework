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
  /** The handler deps.handler() is called every deps.delayMs; if it returns a
   * different value than previously, then waiting for the next delayMs is
   * interrupted prematurely, and the value gets refreshed. */
  deps: {
    delayMs: MaybeCallable<number>;
    handler: () => string;
  };
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
 *   requested with waitRefresh().
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
  /** A never throwing version of options.onError(). */
  private onErrorNothrow: CachedRefreshedValueOptions<TValue>["onError"];

  /**
   * Initializes the instance.
   */
  constructor(public readonly options: CachedRefreshedValueOptions<TValue>) {
    this.onErrorNothrow = (...args) => {
      try {
        options.onError(...args);
      } catch {
        // noop
      }
    };
  }

  /**
   * Returns latest cached value.
   */
  async cached(): Promise<TValue> {
    runInVoid(this.refreshLoop());
    return this.latestValue ?? this.nextValue.promise;
  }

  /**
   * Triggers the call to resolverFn() ASAP (i.e. sooner than the next interval
   * specified in delayMs) and waits for the next successful cache refresh.
   */
  async waitRefresh(): Promise<void> {
    runInVoid(this.refreshLoop());
    // To unfreeze, we want a completely new resolverFn() call to finish within
    // refreshLoop(). I.e. the call to resolverFn() must start strictly AFTER we
    // entered waitRefresh(); thus, `while` loop below may spin twice.
    const startCallCount = this.resolverFnCallCount;
    while (this.resolverFnCallCount <= startCallCount) {
      // Skip waiting between loops.
      this.skipDelay?.();
      // After await resolves here, it's guaranteed that this.nextValue will be
      // reassigned with a new pDefer (see refreshLoop() body).
      await this.nextValue.promise;
    }
  }

  /**
   * Destroys the instance. Stops refreshing the value and any call to it will
   * result in an error.
   */
  destroy(): void {
    this.destroyedError = Error(
      `${this.constructor.name}: This instance is destroyed`
    );
  }

  @Memoize()
  private async refreshLoop(): Promise<void> {
    while (!this.destroyedError) {
      const warningDelayMs = maybeCall(this.options.warningTimeoutMs);
      const depsDelayMs = maybeCall(this.options.deps.delayMs);
      const depsPrev = this.options.deps.handler();
      const startTime = performance.now();

      const warningTimeout = setTimeout(
        () =>
          this.onErrorNothrow(
            Error(
              `${this.constructor.name}.refreshLoop: Warning: ` +
                `resolverFn did not complete in ${warningDelayMs} ms!`
            ),
            performance.now() - startTime
          ),
        warningDelayMs
      );
      try {
        this.resolverFnCallCount++;
        this.latestValue = await this.options.resolverFn();
        const oldNextValue = this.nextValue;
        this.nextValue = pDefer();
        oldNextValue.resolve(this.latestValue);
      } catch (e: unknown) {
        this.onErrorNothrow(e, performance.now() - startTime);
      } finally {
        clearTimeout(warningTimeout);
      }

      // Wait for delayMs with ability to skip it.
      const delayDefer = pDefer<void>();
      this.skipDelay = () => delayDefer.resolve();
      const depsInterval = setInterval(() => {
        if (this.options.deps.handler() !== depsPrev) {
          delayDefer.resolve();
        }
      }, depsDelayMs);
      try {
        this.options
          .delay(maybeCall(this.options.delayMs))
          .finally(() => delayDefer.resolve())
          .catch(() => {});
        await delayDefer.promise;
      } finally {
        clearInterval(depsInterval);
      }
    }

    // Mark current instance as destroyed.
    this.latestValue = null;
    runInVoid(
      this.nextValue.promise.catch(() => {
        // Stops unhandled promise rejection errors.
      })
    );
    this.nextValue.reject(this.destroyedError);
  }
}
