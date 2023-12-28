import { mapJoin } from "./misc";

/**
 * Represents a container of TObj's that can be created in the container from
 * the TData data. If the object corresponding to a particular data already
 * exists, it's returned instead of being created.
 */
export class Registry<TData, TObj> {
  private map = new Map<string, TObj>();

  constructor(
    private options: {
      /** A handler which computes an unique key from the data provided. */
      key: (data: TData) => string;
      /** A handler which creates a new object from its data. */
      create: (data: TData) => TObj;
      /** This handler is called when an object is deleted from the registry. */
      end?: (obj: TObj) => Promise<unknown>;
    }
  ) {}

  /**
   * Computes the key for the data and returns the object corresponding to that
   * key if it already exists in the registry. Otherwise, creates a new object,
   * adds it to the registry and returns it.
   */
  getOrCreate(data: TData): [obj: TObj, key: string] {
    const key = this.options.key(data);
    let obj = this.map.get(key);
    if (!obj) {
      obj = this.options.create(data);
      this.map.set(key, obj);
    }

    return [obj, key];
  }

  /**
   * Deletes all objects from the registry except those whose keys are in the
   * keepKeys set. For each object, calls an optional end() handler.
   */
  async deleteExcept(keepKeys: Set<string>): Promise<void> {
    await mapJoin([...this.map], async ([key, obj]) => {
      if (!keepKeys.has(key)) {
        this.map.delete(key);
        await this.options.end?.(obj);
      }
    });
  }
}
