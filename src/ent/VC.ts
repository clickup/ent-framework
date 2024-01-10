import { inspect } from "util";
import delay from "delay";
import { Memoize } from "fast-typescript-memoize";
import compact from "lodash/compact";
import type { Client } from "../abstract/Client";
import type { Handler } from "../abstract/Loader";
import { Loader } from "../abstract/Loader";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import type { Shard } from "../abstract/Shard";
import { MASTER, STALE_REPLICA } from "../abstract/Shard";
import { Timeline } from "../abstract/Timeline";
import { minifyStack } from "../helpers/misc";
import { VCCaches } from "./VCCaches";
import type { VCFlavor } from "./VCFlavor";
import { VCWithStacks } from "./VCFlavor";
import { VCTrace } from "./VCTrace";

/**
 * Guest VC: has minimum permissions. Typically if the user is not logged in,
 * this VC is used.
 */
export const GUEST_ID = "guest";

/**
 * Temporary "omniscient" VC. Any Ent can be loaded with it, but this VC is
 * replaced with lower-pri VC as soon as possible. E.g. when some Ent is loaded
 * with omni VC, its ent.vc is assigned to either this Ent's "owner" VC
 * (accessible via VC pointing field) or, if not detected, to guest VC.
 */
export const OMNI_ID = "omni";

/**
 * Useful for debugging, to identify unique VC objects.
 */
let instanceNumber = 0;

/**
 * VC - Viewer Context.
 *
 * VC is set per HTTP request (or per worker job) in each Ent and represents the
 * person who is about to run some database operation. It can represent a user,
 * or a guest, or a bot observing that Ent.
 *
 * Depending on the Ent's Configuration object and privacy rules, it may allow
 * the user to load/insert/update/etc. or to traverse to related objects.
 */
export class VC {
  //
  // WARNING!
  //
  // DO NOT use ES2020 #-private properties for VC, use only native TS private
  // properties. This is because VC is often times cloned by core libraries
  // (e.g. Apollo GraphQL context could be a VC, or Express Request user is VC
  // etc.). ES2020 #-private properties are simulated via WeakMap during
  // transpilation which requires a call to VC's constructor. And while cloning
  // via Object.create()/Object.setPrototypeOf(), the constructor is not called.
  //

  private annotationCache?: QueryAnnotation;
  private caches: VCCaches<Function | symbol, unknown> | undefined = undefined;
  private instanceNumber = (instanceNumber++).toString(); // string makes it visible in Chrome memory dump profiler

  /**
   * Please please don't call this method except one or two core places. The
   * idea is that we create an "origin" VC once and then derive all other VCs
   * from it (possibly upgrading or downgrading permissions, controlling
   * master/replica read policy etc.). It's also good to trace the entire chain
   * of calls and reasons, why some object was accessed.
   */
  static createGuestPleaseDoNotUseCreationPointsMustBeLimited({
    trace,
    cachesExpirationMs,
  }: {
    trace?: string;
    cachesExpirationMs?: number;
  } = {}): VC {
    return new VC(
      new VCTrace(trace),
      GUEST_ID,
      null,
      new Map(),
      new Map(),
      { heartbeat: async () => {}, delay },
      true,
      cachesExpirationMs ?? 0
    );
  }

  /**
   * This is to show VCs in console.log() and inspect() nicely.
   */
  [inspect.custom](): string {
    return `<${this.toString()}>`;
  }

  /**
   * Some IDs are cached in VC (e.g. is this ID readable? is it writable? is
   * this VC an admin VC?). Also, people may define their own VC-local caches.
   */
  cache<TInstance>(Class: { new (vc: VC): TInstance }): TInstance;

  /**
   * Same as the above overload, but allows to use a custom creating function.
   * This is useful when e.g. cached values are async-created.
   */
  cache<TInstance>(tag: symbol, creator: (vc: VC) => TInstance): TInstance;

  // The actual implementation of the above overloads.
  cache<TInstance>(
    ClassOrTag: { new (vc: VC): TInstance } | symbol,
    creator?: (vc: VC) => TInstance
  ): TInstance {
    this.caches ??= new VCCaches(this.cachesExpirationMs);

    let cache = this.caches.get(ClassOrTag) as TInstance | undefined;
    if (!cache) {
      cache =
        typeof ClassOrTag === "function"
          ? new ClassOrTag(this)
          : creator!(this);
      this.caches.set(ClassOrTag, cache);
    }

    return cache;
  }

  /**
   * Returns a cached instance of Loader whose actual code is defined in
   * HandlerClass. In case there is no such Loader yet, creates it.
   */
  loader<TLoadArgs extends unknown[], TReturn>(HandlerClass: {
    new (vc: VC): Handler<TLoadArgs, TReturn>;
    $loader?: symbol;
  }): Loader<TLoadArgs, TReturn> {
    let symbol = HandlerClass.$loader;
    if (!symbol) {
      symbol = HandlerClass.$loader = Symbol(HandlerClass.name);
    }

    return this.cache(symbol, () => new Loader(() => new HandlerClass(this)));
  }

  /**
   * Returns Shard+schemaName timeline which tracks replica staleness for the
   * particular schema name (most likely, table).
   */
  timeline(shard: Shard<Client>, schemaName: string): Timeline {
    const key = shard.no + ":" + schemaName;
    let timeline = this.timelines.get(key);
    if (timeline === undefined) {
      timeline = new Timeline();
      this.timelines.set(key, timeline);
    }

    return timeline;
  }

  /**
   * Serializes Shard timelines (master WAL positions) to a string format. The
   * method always returns a value which is compatible to
   * withDeserializedTimelines() input.
   */
  serializeTimelines(): string | undefined {
    const timelines: Record<string, string> = {};
    for (const [key, timeline] of this.timelines) {
      const timelineStr = timeline.serialize();
      if (timelineStr) {
        timelines[key] = timelineStr;
      }
    }

    // Not a single write has been done in this VC; skip serialization.
    if (Object.keys(timelines).length === 0) {
      return undefined;
    }

    return JSON.stringify(timelines);
  }

  /**
   * Returns the new VC derived from the current one with empty caches and with
   * all replication timelines restored based on the serialized info provided.
   *
   * This method also has a side effect, because it reflects the changes in the
   * global DB state as seen by the current VC's user. It restores previously
   * serialized timelines to the existing VC and all its parent VCs which share
   * the same principal. (The latter happens, because `this.timelines` map is
   * passed by reference to all derived VCs starting from the one which sets
   * principal; see `new VC(...)` clauses all around and toLowerInternal()
   * logic.) The timelines are merged according to wal position (greater wal
   * position wins).
   */
  withDeserializedTimelines(
    ...dataStrs: ReadonlyArray<string | undefined>
  ): VC {
    let deserialized = false;
    for (const dataStr of dataStrs) {
      if (dataStr) {
        const data = JSON.parse(dataStr) as Record<string, string>;
        for (const [key, timelineStr] of Object.entries(data)) {
          const oldTimeline = this.timelines.get(key) ?? null;
          this.timelines.set(
            key,
            Timeline.deserialize(timelineStr, oldTimeline)
          );
          deserialized = true;
        }
      }
    }

    return deserialized ? this.withEmptyCache() : this;
  }

  /**
   * Returns a new VC derived from the current one, but with empty cache.
   */
  withEmptyCache(): VC {
    return new VC(
      this.trace,
      this.principal,
      this.freshness,
      this.timelines,
      this.flavors,
      this.heartbeater,
      this.isRoot,
      this.cachesExpirationMs
    );
  }

  /**
   * Returns a new VC derived from the current one, but with master freshness.
   * Master freshness is inherited by ent.vc after an Ent is loaded.
   */
  withTransitiveMasterFreshness(): VC {
    if (this.freshness === MASTER) {
      return this;
    }

    return new VC(
      this.trace,
      this.principal,
      MASTER,
      this.timelines,
      this.flavors,
      this.heartbeater,
      this.isRoot,
      this.cachesExpirationMs
    );
  }

  /**
   * Returns a new VC derived from the current one, but which forces an Ent to
   * be loaded always from replica. Freshness is NOT inherited by Ents (not
   * transitive): e.g. if an Ent is loaded with STALE_REPLICA freshness, its
   * ent.vc will have the DEFAULT freshness.
   *
   * Also, if an Ent is inserted with a VC of STALE_REPLICA freshness, its VC
   * won't remember it, so next immediate reads will go to a replica and not to
   * the master.
   */
  withOneTimeStaleReplica(): VC {
    if (this.freshness === STALE_REPLICA) {
      return this;
    }

    return new VC(
      this.trace,
      this.principal,
      STALE_REPLICA,
      this.timelines,
      this.flavors,
      this.heartbeater,
      this.isRoot,
      this.cachesExpirationMs
    );
  }

  /**
   * Creates a new VC with default freshness (i.e. not sticky to master or
   * replica, auto-detected on request). Generally, it's not a good idea to use
   * this derivation since we lose some bit of internal knowledge from the past
   * history of the VC, but for e.g. tests or benchmarks, it's fine.
   */
  withDefaultFreshness(): VC {
    if (this.freshness === null) {
      return this;
    }

    return new VC(
      this.trace,
      this.principal,
      null,
      this.timelines,
      this.flavors,
      this.heartbeater,
      this.isRoot,
      this.cachesExpirationMs
    );
  }

  /**
   * Returns a new VC derived from the current one adding some more flavors to
   * it. If no flavors were added, returns the same VC (`this`).
   */
  withFlavor(prepend: "prepend", ...flavors: Array<VCFlavor | undefined>): this;
  withFlavor(...flavors: Array<VCFlavor | undefined>): this;
  withFlavor(...args: unknown[]): VC {
    const prepend = args[0] === "prepend" ? args.shift() : undefined;
    const pairs = (args as Array<VCFlavor | undefined>)
      .filter((flavor): flavor is VCFlavor => flavor !== undefined)
      .map((flavor) => [flavor.constructor, flavor] as const);
    return pairs.length > 0
      ? new VC(
          this.trace,
          this.principal,
          this.freshness,
          this.timelines,
          new Map(
            prepend === "prepend"
              ? [
                  ...pairs,
                  ...[...this.flavors].filter(([cons]) =>
                    pairs.every(([newCons]) => cons !== newCons)
                  ),
                ]
              : [
                  ...this.flavors,
                  // Keys in pairs override the previous flavors, do we don't
                  // need to filter here as above (performance).
                  ...pairs,
                ]
          ),
          this.heartbeater,
          this.isRoot,
          this.cachesExpirationMs
        )
      : this;
  }

  /**
   * Derives the VC with new trace ID.
   */
  withNewTrace(trace: string | undefined): VC {
    return new VC(
      new VCTrace(trace),
      this.principal,
      this.freshness,
      this.timelines,
      this.flavors,
      this.heartbeater,
      this.isRoot,
      this.cachesExpirationMs
    );
  }

  /**
   * Derives the VC with the provided heartbeater injected.
   */
  withHeartbeater(heartbeater: VC["heartbeater"]): VC {
    return new VC(
      this.trace,
      this.principal,
      this.freshness,
      this.timelines,
      this.flavors,
      heartbeater,
      this.isRoot,
      this.cachesExpirationMs
    );
  }

  /**
   * Creates a new VC upgraded to omni permissions. This VC will not
   * be placed to some Ent's ent.vc property; instead, it will be
   * automatically downgraded to either the owning VC of this Ent or
   * to a guest VC (see Ent.ts).
   */
  @Memoize()
  toOmniDangerous(): VC {
    return new VC(
      this.trace,
      OMNI_ID,
      this.freshness,
      this.timelines,
      this.flavors,
      this.heartbeater,
      this.isRoot,
      this.cachesExpirationMs
    );
  }

  /**
   * Creates a new VC downgraded to guest permissions.
   */
  @Memoize()
  public toGuest(): VC {
    return new VC(
      this.trace,
      GUEST_ID,
      this.freshness,
      this.timelines,
      this.flavors,
      this.heartbeater,
      this.isRoot,
      this.cachesExpirationMs
    );
  }
  /**
   * Checks if it's an omni VC.
   */
  isOmni(): boolean {
    return this.principal === OMNI_ID;
  }

  /**
   * Checks if it's a guest VC.
   */
  isGuest(): boolean {
    return this.principal === GUEST_ID;
  }

  /**
   * Checks if it's a regular user (i.e. owning) VC.
   */
  isLoggedIn(): boolean {
    return !this.isOmni() && !this.isGuest();
  }

  /**
   * Returns VC's flavor of the particular type.
   */
  flavor<TFlavor extends VCFlavor>(
    flavor: new (...args: never[]) => TFlavor
  ): TFlavor | null {
    return (this.flavors.get(flavor) as TFlavor | undefined) ?? null;
  }

  /**
   * Used for debugging purposes.
   */
  toString(withInstanceNumber = false): string {
    const flavorsStr = compact([
      withInstanceNumber && this.instanceNumber,
      ...[...this.flavors.values()].map((flavor) => flavor.toDebugString()),
    ]).join(",");
    return (
      `vc:${this.principal}` +
      (flavorsStr ? `(${flavorsStr})` : "") +
      (this.freshness === MASTER
        ? ":master"
        : this.freshness === STALE_REPLICA
        ? ":stale_replica"
        : "")
    );
  }

  /**
   * Returns a debug annotation of this VC.
   */
  toAnnotation(): QueryAnnotation {
    if (!this.annotationCache) {
      this.annotationCache = {
        // DON'T alter trace here anyhow, or it would break the debugging chain.
        trace: this.trace.trace,
        debugStack: "",
        // vc.toString() returns a textual VC with all flavors mixed in
        vc: this.toString(),
        whyClient: undefined,
        attempt: 0,
      };
    }

    if (this.flavor(VCWithStacks)) {
      // This is expensive, only enabled explicitly for this flavor.
      return {
        ...this.annotationCache,
        debugStack: minifyStack(Error().stack?.toString() ?? "", 1),
      };
    }

    return this.annotationCache;
  }

  /**
   * Used internally by Ent framework to lower permissions of an injected VC.
   * For guest, principal === null.
   * - freshness is always reset to default one it VC is demoted
   * - isRoot is changed to false once a root VC is switched to a per-user VC
   */
  @Memoize()
  public toLowerInternal(principal: string | null): VC {
    const newPrincipal = principal ? principal.toString() : GUEST_ID;

    if (this.principal === newPrincipal && this.freshness !== STALE_REPLICA) {
      // Speed optimization (this happens most of the time): a VC is already
      // user-owned, and freshness is default or MASTER.
      return this;
    }

    const switchesToPrincipalFirstTime =
      this.isRoot && newPrincipal !== GUEST_ID && newPrincipal !== OMNI_ID;
    const newIsRoot = this.isRoot && !switchesToPrincipalFirstTime;

    // Create an independent timelines map only when we switch to a non-root VC
    // the 1st time (e.g. in the beginning of HTTP connection).
    const newTimelines = switchesToPrincipalFirstTime
      ? Timeline.cloneMap(this.timelines)
      : this.timelines;

    // A special case: demote STALE_REPLICA freshness to default (it's not
    // transitive and applies only till the next derivation).
    const newFreshness =
      this.freshness === STALE_REPLICA ? null : this.freshness;

    // Something has changed (most commonly omni->principal or omni->guest).
    return new VC(
      this.trace,
      newPrincipal,
      newFreshness,
      newTimelines,
      this.flavors,
      this.heartbeater,
      newIsRoot,
      this.cachesExpirationMs
    );
  }

  /**
   * Private constructor disallows inheritance and manual object creation.
   */
  private constructor(
    /** Trace information to quickly find all the requests done by this VC in
     * debug logs. Trace is inherited once VC is derived. */
    private readonly trace: VCTrace,
    /** A principal (typically user ID) represented by this VC. */
    public readonly principal: string,
    /** Allows to set VC to always use either a master or a replica DB. E.g. if
     * freshness=MASTER, then all the timeline data is ignored, and all the
     * requests are sent to master. */
    public readonly freshness: null | typeof MASTER | typeof STALE_REPLICA,
    /** Replication WAL position per Shard & Ent. Used to make decisions,
     * should a request be sent to a replica or to the master. */
    private timelines: Map<string, Timeline>,
    /** Sticky objects attached to the VC (and inherited when deriving). */
    private flavors: ReadonlyMap<Function, VCFlavor>,
    /** The heartbeat callback is called before each primitive operation. It
     * plays the similar role as AbortController: when called, it may throw
     * sometimes (signalled externally). Delay callback can also be passed since
     * it's pretty common use case to wait for some time and be aborted on a
     * heartbeat exception. */
    public readonly heartbeater: {
      readonly heartbeat: () => Promise<void>;
      readonly delay: (ms: number) => Promise<void>;
    },
    /** If true, it's the initial "root" VC which is not yet derived to any
     * user's VC. */
    private isRoot: boolean,
    /** If nonzero, VC#cache() will return the values which will be auto-removed
     * when VC#cache() hasn't been called for more than this time. */
    private cachesExpirationMs: number
  ) {}
}
