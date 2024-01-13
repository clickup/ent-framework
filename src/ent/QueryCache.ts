import QuickLRU from "quick-lru";
import { MASTER } from "../abstract/Shard";
import type { VC } from "./VC";
import { VCWithQueryCache } from "./VCFlavor";

const OPS = [
  "loadNullable",
  "loadByNullable",
  "select",
  "count",
  "exists",
] as const;

export type AnyClass = new (...args: never[]) => unknown;

type Op = (typeof OPS)[number];

/**
 * Caches Ents loaded by a particular VC. I.e. the same query running for the
 * same VC twice will quickly return the same Ents. This is typically enabled on
 * web servers only, to deliver the fastest UI response.
 */
export class QueryCache {
  private maxQueries?: number;
  private byEntClass?: WeakMap<
    AnyClass,
    Partial<Record<Op, QuickLRU<string, Promise<unknown>>>>
  >;
  public readonly whyOff?: string;

  /**
   * Creates the QueryCache object. It enable caching only if VCWithQueryCache
   * was manually added to the VC by the user, otherwise caching is a no-op.
   */
  constructor(vc: VC) {
    if (vc.freshness === MASTER) {
      this.whyOff = "MASTER freshness";
      return;
    }

    const flavor = vc.flavor(VCWithQueryCache);
    if (!flavor) {
      this.whyOff = "No VCWithQueryCache flavor";
    } else if (flavor.options.maxQueries <= 0) {
      this.whyOff = "VCWithQueryCache#maxQueries is not positive";
    } else {
      this.maxQueries = flavor.options.maxQueries;
    }
  }

  /**
   * Saves a Promise to the cache slot for `op`. If this Promise rejects, the
   * slot will automatically be cleared (we don't cache rejected Promises to not
   * have a risk of caching a transient DB error).
   */
  set(
    EntClass: AnyClass,
    op: Op,
    key: string,
    value: Promise<unknown> | undefined,
  ): this {
    if (!this.maxQueries) {
      // Caching is turned off.
      return this;
    }

    let byOp = (this.byEntClass ??= new WeakMap()).get(EntClass);
    if (!byOp) {
      byOp = {};
      this.byEntClass.set(EntClass, byOp);
    }

    const slot = (byOp[op] ??= new QuickLRU({ maxSize: this.maxQueries }));
    if (value !== undefined) {
      slot.set(key, value);
      // As a side effect of value rejection, clear the cache slot. Note:
      // although we don't re-throw in the callback, this does not swallow the
      // rejection, because we don't save the result of value.catch() anywhere
      // and don't return it. It's a pure side effect.
      value.catch(() => slot!.delete(key));
    } else {
      slot.delete(key);
    }

    return this;
  }

  /**
   * Deletes cache slots or keys for an Ent.
   */
  delete(EntClass: AnyClass, ops: Op[], key?: string): this {
    const byOp = this.byEntClass?.get(EntClass);
    if (!byOp) {
      return this;
    }

    for (const op of ops) {
      if (key === undefined) {
        delete byOp[op];
      } else {
        byOp[op]?.delete(key);
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
    EntClass: AnyClass,
    op: Op,
    key: string,
  ): Promise<TValue> | undefined {
    const byOp = this.byEntClass?.get(EntClass);
    if (!byOp) {
      return undefined;
    }

    return byOp[op]?.get(key) as Promise<TValue> | undefined;
  }

  /**
   * Read-through caching pattern.
   */
  async through<TValue>(
    EntClass: AnyClass,
    op: Op,
    key: string,
    creator: () => Promise<TValue>,
  ): Promise<TValue> {
    if (!this.maxQueries) {
      // Caching is turned off.
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
