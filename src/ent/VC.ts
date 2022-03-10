import { inspect } from "util";
import compact from "lodash/compact";
import { Client } from "../abstract/Client";
import { Handler, Loader } from "../abstract/Loader";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { MASTER, Shard, STALE_REPLICA } from "../abstract/Shard";
import { Timeline } from "../abstract/Timeline";
import { minifyStack } from "../helpers";
import Memoize from "../Memoize";
import { VCFlavor, VCWithStacks } from "./VCFlavor";
import { VCTrace } from "./VCTrace";

/**
 * Guest VC: has minimum permissions. Typically if the user is not logged in,
 * this VC is used.
 */
const GUEST_ID = "guest";

/**
 * Temporary "omniscient" VC. Any Ent can be loaded with it, but this VC is
 * replaced with lower-pri VC as soon as possible. E.g. when some Ent is loaded
 * with omni VC, its ent.vc is assigned to either this Ent's "owner" VC
 * (accessible via VC pointing field) or, if not detected, to guest VC.
 */
const OMNI_ID = "omni";

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
  // DO NOT use ES2020 private properties for VC, use only native TS private
  // properties. This is because VC is often times cloned by core libraries
  // (e.g. Apollo GraphQL context could be a VC, or Express Request user is VC
  // etc.). Private properties are simulated via WeakMap during transpilation
  // which requires a call to VC's constructor. And while cloning via
  // Object.create()/Object.setPrototypeOf(), the constructor is not called.
  //

  private annotationCache?: QueryAnnotation;
  private instanceNumber = instanceNumber++;
  private caches = new Map<Function | symbol, any>();

  /**
   * This is to show VCs in console.log() and inspect() nicely.
   */
  [inspect.custom]() {
    return `<${this.toString()}>`;
  }

  /**
   * Private constructor disallows inheritance and manual object creation.
   */
  private constructor(
    /** Trace information to quickly find all the requests done by this VC in
     * debug logs. Trace is inherited once VC is derived. */
    private readonly trace: VCTrace,
    /** ID of the "user" represented by this VC. */
    public readonly userID: string,
    /** Allows to set VC to always use either a master or a replica DB. E.g. if
     * freshness=MASTER, then all the timeline data is ignored, and all the
     * requests are sent to master. */
    public readonly freshness: null | typeof MASTER | typeof STALE_REPLICA,
    /** Replication WAL position per shard & Ent. Used to make decisions,
     * should a request be sent to a replica or to the master. */
    private timelines: Map<string, Timeline>,
    /** Sticky objects attached to the VC (and inherited when deriving). */
    private flavors: ReadonlyMap<Function, VCFlavor>,
    /** If true, it's the initial "root" VC which is not yet derived to any
     * user's VC. */
    private isRoot: boolean
  ) {}

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
    let cache: TInstance = this.caches.get(ClassOrTag);
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
  loader<TLoadArgs extends any[], TReturn>(HandlerClass: {
    new (vc: VC): Handler<TLoadArgs, TReturn>;
    $loader?: symbol;
  }) {
    let symbol = HandlerClass.$loader;
    if (!symbol) {
      symbol = HandlerClass.$loader = Symbol(HandlerClass.name);
    }

    return this.cache(symbol, () => new Loader(() => new HandlerClass(this)));
  }

  /**
   * Returns shard+schemaName timeline which tracks replica staleness for the
   * particular schema name (most likely, table).
   */
  timeline(shard: Shard<Client>, schemaName: string) {
    const key = shard.no + ":" + schemaName;
    let timeline = this.timelines.get(key);
    if (timeline === undefined) {
      timeline = new Timeline();
      this.timelines.set(key, timeline);
    }

    return timeline;
  }

  /**
   * Serializes shard timelines (master WAL positions) to a string format. The
   * method always returns a value which is compatible to
   * withDeserializedTimelines() input.
   */
  serializeTimelines() {
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
   * the same userID. (The latter happens, because `this.timelines` map is
   * passed by reference to all derived VCs starting from the one which sets
   * userID; see `new VC(...)` clauses all around and toLowerInternal() logic.)
   * The timelines are merged according to wal position (greater wal position
   * wins).
   */
  withDeserializedTimelines(...dataStrs: ReadonlyArray<string | undefined>) {
    for (const dataStr of dataStrs) {
      if (dataStr) {
        const data = JSON.parse(dataStr) as Record<string, string>;
        for (const [key, timelineStr] of Object.entries(data)) {
          const oldTimeline = this.timelines.get(key) ?? null;
          this.timelines.set(
            key,
            Timeline.deserialize(timelineStr, oldTimeline)
          );
        }
      }
    }

    return this.withEmptyCache();
  }

  /**
   * Returns a new VC derived from the current one, but with empty cache.
   */
  withEmptyCache() {
    return new VC(
      this.trace,
      this.userID,
      this.freshness,
      this.timelines,
      this.flavors,
      this.isRoot
    );
  }

  /**
   * Returns a new VC derived from the current one, but with master freshness.
   * Master freshness is inherited by ent.vc after an Ent is loaded.
   */
  withTransitiveMasterFreshness() {
    if (this.freshness === MASTER) {
      return this;
    }

    return new VC(
      this.trace,
      this.userID,
      MASTER,
      this.timelines,
      this.flavors,
      this.isRoot
    );
  }

  /**
   * Returns a new VC derived from the current one, but which forces an Ent to
   * be loaded always from replica. Freshness is NOT inherited by Ents
   * (not transitive): e.g. if an Ent is loaded with STALE_REPLICA freshness,
   * its ent.vc will have the DEFAULT freshness.
   */
  withOneTimeStaleReplica() {
    if (this.freshness === STALE_REPLICA) {
      return this;
    }

    return new VC(
      this.trace,
      this.userID,
      STALE_REPLICA,
      this.timelines,
      this.flavors,
      this.isRoot
    );
  }

  /**
   * Returns a new VC derived from the current one adding some more
   * flavors to it.
   */
  withFlavor(flavor: VCFlavor | undefined) {
    return flavor
      ? new VC(
          this.trace,
          this.userID,
          this.freshness,
          this.timelines,
          new Map([...this.flavors.entries(), [flavor.constructor, flavor]]),
          this.isRoot
        )
      : this;
  }

  /**
   * Derives the VC with new trace ID.
   */
  withNewTrace(prefix?: string) {
    return new VC(
      new VCTrace(prefix ?? this.trace.prefix),
      this.userID,
      this.freshness,
      this.timelines,
      this.flavors,
      this.isRoot
    );
  }

  /**
   * Creates a new VC upgraded to omni permissions. This VC will not
   * be placed to some Ent's ent.vc property; instead, it will be
   * automatically downgraded to either the owning VC of this Ent or
   * to a guest VC (see Ent.ts).
   */
  @Memoize()
  toOmniDangerous() {
    return new VC(
      this.trace,
      OMNI_ID,
      this.freshness,
      this.timelines,
      this.flavors,
      this.isRoot
    );
  }

  /**
   * Checks if it's an omni VC.
   */
  isOmni(): boolean {
    return this.userID === OMNI_ID;
  }

  /**
   * Checks if it's a guest VC.
   */
  isGuest(): boolean {
    return this.userID === GUEST_ID;
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
    flavor: new (...args: any[]) => TFlavor
  ): TFlavor | null {
    return (this.flavors.get(flavor) as TFlavor | undefined) ?? null;
  }

  /**
   * Used for debugging purposes.
   */
  toString() {
    const flavorsStr = compact([
      this.instanceNumber.toString(),
      ...[...this.flavors.values()].map((flavor) => flavor.toDebugString()),
    ]).join(",");
    return (
      `vc:${this.userID}(${flavorsStr})` +
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
        // vc has all flavors mixed in
        vc: this.toString(),
        whyClient: undefined,
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
   * For guest, userID === null.
   * - freshness is always reset to default one it VC is demoted
   * - isRoot is changed to false once a root VC is switched to a per-user VC
   */
  @Memoize()
  public toLowerInternal(userID: string | null) {
    const newUserID = userID ? userID.toString() : GUEST_ID;

    if (this.userID === newUserID && this.freshness !== STALE_REPLICA) {
      // Speed optimization (this happens most of the time): a VC is already
      // user-owned, and freshness is default or MASTER.
      return this;
    }

    const switchesToUserFirstTime =
      this.isRoot && newUserID !== GUEST_ID && newUserID !== OMNI_ID;
    const newIsRoot = this.isRoot && !switchesToUserFirstTime;

    // Create an independent timelines map only when we switch to a non-root VC
    // the 1st time (e.g. in the beginning of HTTP connection).
    const newTimelines = switchesToUserFirstTime
      ? Timeline.cloneMap(this.timelines)
      : this.timelines;

    // A special case: demote STALE_REPLICA freshness to default (it's not
    // transitive and applies only till the next derivation).
    const newFreshness =
      this.freshness === STALE_REPLICA ? null : this.freshness;

    // Something has changed (most commonly omni->userID or omni->guest).
    return new VC(
      this.trace,
      newUserID,
      newFreshness,
      newTimelines,
      this.flavors,
      newIsRoot
    );
  }

  /**
   * Please please don't call this method except one or two core places. The
   * idea is that we create an "origin" VC once and then derive all other VCs
   * from it (possibly upgrading or downgrading permissions, controlling
   * master/replica read policy etc.). It's also good to trace the entire chain
   * of calls and reasons, why some object was accessed.
   */
  static createGuestPleaseDoNotUseCreationPointsMustBeLimited() {
    return new VC(new VCTrace(), GUEST_ID, null, new Map(), new Map(), true);
  }
}
