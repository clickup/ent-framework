import { mapJoin } from "./misc";

/**
 * Represents a container of TObj's that can be created in the container from
 * the TInit data. If the object corresponding to a particular init data already
 * exists, it's returned instead of being created.
 */
export class Registry<TInit, TObj> {
  private map = new Map<string, { obj: TObj; key: string; init: TInit }>();

  constructor(
    private options: {
      /** A handler which computes an unique key from the init data provided. */
      key: (init: TInit) => string;
      /** A handler which creates a new object from its init data. */
      create: (init: TInit) => TObj;
      /** This handler is called when an object is deleted from the registry. */
      end?: (obj: TObj, key: string, init: TInit) => Promise<unknown>;
    },
  ) {}

  /**
   * Computes the key for the init data and returns the object corresponding to
   * that key if it already exists in the registry. Otherwise, creates a new
   * object, adds it to the registry and returns it.
   */
  getOrCreate(init: TInit): [obj: TObj, key: string] {
    const key = this.options.key(init);
    let obj = this.map.get(key)?.obj;
    if (!obj) {
      obj = this.options.create(init);
      this.map.set(key, { obj, key, init });
    }

    return [obj, key];
  }

  /**
   * Deletes all objects from the registry except those whose keys are in the
   * keepKeys set. For each object, calls an optional end() handler.
   */
  async deleteExcept(keepKeys: Set<string>): Promise<void> {
    await mapJoin([...this.map], async ([key, { obj, init }]) => {
      if (!keepKeys.has(key)) {
        this.map.delete(key);
        await this.options.end?.(obj, key, init);
      }
    });
  }
}
