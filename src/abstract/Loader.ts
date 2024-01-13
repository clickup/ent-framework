import type { DeferredPromise } from "p-defer";
import pDefer from "p-defer";

export interface Handler<TLoadArgs extends unknown[], TReturn> {
  onCollect: (...args: TLoadArgs) => void | "flush" | "wait";
  onWait?: () => Promise<void>;
  onFlush: (collected: number) => Promise<void>;
  onReturn: (...args: TLoadArgs) => TReturn;
}

interface LoaderSession<TLoadArgs extends unknown[], TReturn> {
  handler: Handler<TLoadArgs, TReturn>;
  flush: Promise<void>;
  flushNow: DeferredPromise<void>;
  collected: number;
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
export class Loader<TLoadArgs extends unknown[], TReturn> {
  private session: LoaderSession<TLoadArgs, TReturn> | null = null;

  constructor(private handlerCreator: () => Handler<TLoadArgs, TReturn>) {}

  async load(...args: TLoadArgs): Promise<TReturn> {
    const session = (this.session ??= {
      collected: 0,
      handler: this.handlerCreator(),
      flushNow: pDefer<void>(),
      flush: new Promise((resolve) =>
        process.nextTick(async () => {
          await Promise.race([
            session.handler.onWait?.(),
            session.flushNow.promise,
          ]);
          this.session = this.session === session ? null : this.session;
          resolve(session.handler.onFlush(session.collected));
        }),
      ),
    });

    session.collected++;
    if (session.handler.onCollect(...args) === "flush") {
      this.session = this.session === session ? null : this.session;
      session.flushNow.resolve();
    }

    await session.flush;
    return session.handler.onReturn(...args);
  }
}
