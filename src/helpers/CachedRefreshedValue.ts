import { Memoize } from "fast-typescript-memoize";
import type { DeferredPromise } from "p-defer";
import pDefer from "p-defer";
import { runInVoid } from "./misc";

export interface CachedRefreshedValueOptions<TValue> {
  /** Delay between calling resolver. */
  delayMs: number;
  /** Log a timeout Error if a resolver takes more than X ms to complete. */
  warningTimeoutMs: number;
  /** A resolver function that returns the value. It's assumed that this
   * function would eventually either resolve or throw. */
  resolverFn: () => Promise<TValue>;
  /** An error handler. */
  onError: (error: unknown) => void;
  /** A custom delay implementation. */
  delay: (ms: number) => Promise<void>;
}

/**
 * Utility class to provide a caching layer for a resolverFn with the following
 * assumptions:
 * - The value is stable and does not change frequently.
 * - The resolverFn can throw or take more time to resolve (e.g. outage). In
 *   that case, the cached value is still valid, unless a fresh value is
 *   requested.
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
  /** Timestamp of the moment when the last value was pulled. Implemented for
   * eventual consistency. */
  private latestAt: number = 0;
  /** Whether the instance is destroyed or not. Used to prevent memory leaks in
   * unit tests. */
  private destroyedError: Error | null = null;
  /** A callback to skip the current delay() call. */
  private skipDelay: (() => void) | null = null;

  constructor(public readonly options: CachedRefreshedValueOptions<TValue>) {}

  /**
   * Returns latest cached value.
   */
  async cached(): Promise<TValue> {
    runInVoid(this.refreshLoop());
    return this.latestValue ?? this.nextValue.promise;
  }

  /**
   * Waits for the next successful cache refresh.
   */
  async waitRefresh(): Promise<void> {
    runInVoid(this.refreshLoop());
    // Keep waiting till we get a value which is fresh enough.
    const startTime = performance.now();
    while (this.latestAt <= startTime) {
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
    this.destroyedError = new Error(
      `${this.constructor.name}: This instance is destroyed`
    );
  }

  @Memoize()
  private async refreshLoop(): Promise<void> {
    while (!this.destroyedError) {
      const startTime = performance.now();
      const timeout = setTimeout(() => {
        try {
          this.options.onError(
            Error(
              `${this.constructor.name}.${this.refreshLoop.name}: Warning: resolverFn did not complete in ${this.options.warningTimeoutMs}ms!`
            )
          );
        } catch (e: unknown) {
          // noop
        }
      }, this.options.warningTimeoutMs);
      try {
        const val = await this.options.resolverFn();
        if (this.latestAt < startTime) {
          this.latestAt = startTime;
          this.latestValue = val;
          // We must ensure that we fulfill and replace the promise during one
          // event loop iteration.
          const oldNextValue = this.nextValue;
          this.nextValue = pDefer<TValue>();
          oldNextValue.resolve(val);
        }
      } catch (err: unknown) {
        try {
          this.options.onError(err);
        } catch (e: unknown) {
          // noop
        }
      } finally {
        clearTimeout(timeout);
      }

      // Wait for delayMs with ability to skip it.
      const delayDeferred = pDefer<void>();
      this.skipDelay = () => delayDeferred.resolve();
      runInVoid(
        this.options
          .delay(this.options.delayMs)
          .finally(() => delayDeferred.resolve())
      );
      await delayDeferred.promise;
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
