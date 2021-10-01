import QuickLRU from "quick-lru";
import { MASTER } from "../abstract/Shard";
import { VC } from "./VC";
import { VCWithQueryCache } from "./VCFlavor";

const OPS = ["loadNullable", "loadByNullable", "select", "count"] as const;

type AnyEntClass = new (...args: any) => any;

type Op = typeof OPS[number];

export class QueryCache {
  private cache?: {
    options: VCWithQueryCache["options"];
    byEntClass: Map<
      AnyEntClass,
      Record<Op, QuickLRU<string, Promise<unknown>>>
    >;
  };

  constructor(vc: VC) {
    if (vc.freshness === MASTER) {
      return;
    }

    const flavor = vc.flavor(VCWithQueryCache)!;
    if (flavor) {
      this.cache = { options: flavor.options, byEntClass: new Map() };
    }
  }

  /**
   * Saves a Promise to the cache slot for `op`. If this Promise rejects, the
   * slot will automatically be cleared (we don't cache rejected Promises to not
   * have a risk of caching a transient SQL error).
   */
  set(
    EntClass: AnyEntClass,
    op: Op,
    key: string,
    value: Promise<unknown> | undefined
  ) {
    if (!this.cache) {
      return this;
    }

    let byOp = this.cache.byEntClass.get(EntClass);
    if (!byOp) {
      byOp = Object.fromEntries(
        OPS.map((op) => [
          op,
          new QuickLRU({ maxSize: this.cache!.options.maxQueries }),
        ])
      ) as Record<Op, QuickLRU<string, Promise<unknown>>>;
      this.cache.byEntClass.set(EntClass, byOp);
    }

    const slot = byOp[op];
    if (value !== undefined) {
      slot.set(key, value);
      // As a side effect of value rejection, clear the cache slot. Note:
      // although we don't re-throw in the callback, this does not swallow the
      // rejection, because we don't save the result of value.catch() anywhere
      // and don't return it. It's a pure side effect.
      value.catch(() => slot.delete(key));
    } else {
      slot.delete(key);
    }

    return this;
  }

  /**
   * Deletes cache slots or keys for an Ent.
   */
  delete(EntClass: AnyEntClass, ops: Op[], key?: string) {
    const byOp = this.cache?.byEntClass.get(EntClass);
    if (!byOp) {
      return this;
    }

    for (const op of ops) {
      if (key === undefined) {
        byOp[op].clear();
      } else {
        byOp[op].delete(key);
      }
    }

    return this;
  }

  /**
   * This method is non-async on intent. We store Promises in the cache, not end
   * values, because we want the code to join awaiting an ongoing operation in
   * case it's inflight already.
   */
  get<TValue>(
    EntClass: AnyEntClass,
    op: Op,
    key: string
  ): Promise<TValue> | undefined {
    const slot = this.cache?.byEntClass.get(EntClass);
    if (!slot) {
      return undefined;
    }

    return slot[op].get(key) as Promise<TValue> | undefined;
  }

  /**
   * Read-through caching pattern.
   */
  async through<TValue>(
    EntClass: AnyEntClass,
    op: Op,
    key: string,
    creator: () => Promise<TValue>
  ): Promise<TValue> {
    if (!this.cache) {
      return creator();
    }

    let value = this.get<TValue>(EntClass, op, key);
    if (value === undefined) {
      value = creator();
      this.set(EntClass, op, key, value);
    }

    return value;
  }
}
