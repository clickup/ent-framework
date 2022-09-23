import type { DeferredPromise } from "p-defer";
import pDefer from "p-defer";

export interface Handler<TLoadArgs extends any[], TReturn> {
  onCollect: (...args: TLoadArgs) => void;
  onFlush: () => Promise<void>;
  onReturn: (...args: TLoadArgs) => TReturn;
}

/**
 * Loader allows to batch single-item requests into batches. It uses a different
 * architecture than Facebook's DataLoader:
 *
 * - it's more developers-friendly: multi-parameter loadings, you may implement
 *   automatic deduplication of requests at onCollect stage, no requirement to
 *   serialize/deserialize requests into string keys;
 * - strong-typed load() and handler arguments.
 *
 * To create your own specific loader:
 * 1. Define a handler class with onCollect/onReturn/onFlush methods.
 * 2. In onCollect, accumulate the incoming requests in the handler object's
 *    private property.
 * 3. In onFlush, process what you accumulated so far and save to another
 *    handler object's private property (and by adding, say, delay(50) in the
 *    beginning of onFlush, you may group the requests coming within the 1st 50
 *    ms).
 * 3. In onReturn, extract the result corresponding to the request and return
 *    it, so the caller will receive it seamlessly as a load() return value.
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
