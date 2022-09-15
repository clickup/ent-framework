import { inspect } from "util";

/**
 * Error: while inserting or updating, DB unique key was violated,
 * so the Ent was not mutated.
 */
export class EntUniqueKeyError extends Error {
  constructor(public readonly entName: string, public readonly input: any) {
    super(
      `${entName} mutation violates unique key constraint: ` +
        inspect(input, { breakLength: Infinity })
    );
    this.name = this.constructor.name;
  }

  /**
   * Returns a promise of T on success, and undefined in case unique key
   * violation happened during the promise resolution.
   */
  static async ignore<T>(promise: Promise<T>): Promise<T | undefined> {
    try {
      return await promise;
    } catch (e: any) {
      if (!(e instanceof this)) {
        throw e;
      }

      return undefined;
    }
  }
}
