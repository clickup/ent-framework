/**
 * VCFlavor is some piece of info which is transitively attached to a VC and is
 * preserved when VC derivation (upgrade/downgrade) is happening. This piece of
 * info may be just an object of a separate class with no data (acts like a
 * boolean flag), or it can be an object with payload.
 *
 * For each flavor type, only a single VCFlavor object may exist.
 */
export abstract class VCFlavor {
  static readonly _tag: "VCFlavorClass";
  readonly _tag!: "VCFlavorInstance";

  /**
   * Appended to the end of VC.toString() result.
   */
  toDebugString() {
    return "";
  }
}

/**
 * If turned on, the debug logs will contain caller stack traces for each Ent
 * query. This is expensive, use in dev mode only!
 */
export class VCWithStacks extends VCFlavor {}

/**
 * If set, Ent cache is enabled for operations in this VC.
 */
export class VCWithQueryCache extends VCFlavor {
  constructor(public readonly options: { maxQueries: number }) {
    super();
  }
}
