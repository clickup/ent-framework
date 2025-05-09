import type { MaybeCallable } from "../internal/misc";

/**
 * Options for ShardNamer constructor.
 */
export interface ShardNamerOptions {
  /** A format string to turn a Shard number to Shard name (e.g. "sh%04d"). */
  nameFormat: string;
  /** A DB engine query that should return the names of Shards served by this
   * Client. */
  discoverQuery: MaybeCallable<string>;
}

/**
 * Client-specific logic on how to synchronously convert an ID into Shard number
 * (only for the use cases when ID is prefixed with a Shard number), how to
 * build Shard names, and how to extract Shard number from a Shard name.
 */
export abstract class ShardNamer {
  /**
   * Synchronously extracts Shard number from an ID prefix, for the use cases
   * where IDs have this information.
   */
  abstract shardNoByID(id: string): number;

  /** Number of decimal digits in an ID allocated for Shard number. Calculated
   * dynamically based on `ShardNamerOptions#nameFormat` (e.g. for "sh%04d", it
   * will be 4 since it expands to "sh0012"). */
  protected readonly shardNoPadLen: number;

  /**
   * Initializes an instance of ShardNamer.
   */
  constructor(readonly options: ShardNamerOptions) {
    const match = this.shardNameByNo(0).match(/(\d+)/);
    this.shardNoPadLen = match ? match[1].length : 0;
    if (!this.shardNoPadLen) {
      throw Error("Invalid nameFormat value");
    }
  }

  /**
   * Converts a Shard name to Shard number. Returns null if it's not a correct
   * Shard name.
   */
  shardNoByName(name: string): number | null {
    const match = name?.match(/(\d+)/);
    const no = match ? parseInt(match[1]) : null;
    return no !== null && name === this.shardNameByNo(no) ? no : null;
  }

  /**
   * Builds the Shard name (e.g. for PG, "schema name") by Shard number using
   * `ShardNamerOptions#nameFormat`.
   *
   * E.g. nameFormat="sh%04d" generates names like "sh0042".
   */
  shardNameByNo(no: number): string {
    return this.options.nameFormat.replace(
      /%(0?)(\d+)[sd]/,
      (_, zero: string, d: string) =>
        no.toString().padStart(zero ? parseInt(d) : 0, "0"),
    );
  }
}
