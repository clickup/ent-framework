import pDefer, { DeferredPromise } from "p-defer";

export interface Handler<TLoadArgs extends any[], TReturn> {
  onCollect: (...args: TLoadArgs) => void;
  onReturn: (...args: TLoadArgs) => TReturn;
  onFlush: () => Promise<void>;
}

/**
 * Loader allows to batch single-item requests into batches. It uses a different
 * architecture than Facebook's DataLoader:
 * - it's more developers-friendly: multi-parameter loadings, automatic
 *   deduplication of requests, no requirement to serialize/deserialize requests
 *   into string keys;
 * - strong-typed load() and handler arguments.
 *
 * To create your own specific loader, define a handler class with
 * onCollect/onReturn/onFlush methods.
 *
 * In the future, Batcher may be refactored to use Loader as the underlying
 * engine, but for now they're separate (Batcher is much more domain logic
 * specific and Loader is completely abstract).
 */
export class Loader<TLoadArgs extends any[], TReturn> {
  private handler: Handler<TLoadArgs, TReturn> | null = null;
  private defer: DeferredPromise<any> | null = null;
  private RESOLVED_PROMISE = Promise.resolve();

  constructor(private handlerCreator: () => Handler<TLoadArgs, TReturn>) {}

  async load(...args: TLoadArgs) {
    if (this.handler === null) {
      this.handler = this.handlerCreator();
    }

    const handler = this.handler;
    this.handler.onCollect(...args);
    await this.waitFlush();
    return handler.onReturn(...args);
  }

  async waitFlush<TResult>(): Promise<TResult> {
    if (this.defer === null) {
      this.defer = pDefer<any>();
      this.RESOLVED_PROMISE.then(() => {
        process.nextTick(async () => {
          const defer = this.defer!;
          const handler = this.handler!;
          this.defer = null;
          this.handler = null;
          handler
            .onFlush()
            .then(defer.resolve.bind(defer))
            .catch(defer.reject.bind(defer));
        });
      }).catch(() => {});
    }

    return this.defer.promise;
  }
}
