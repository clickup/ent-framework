import { ShardError } from "../abstract/ShardError";
import { ShardNamer } from "../abstract/ShardNamer";
import { sanitizeIDForDebugPrinting } from "../internal/misc";
import { parseCompositeRow } from "./internal/parseCompositeRow";

/**
 * ShardNamer implementation for PG.
 */
export class PgShardNamer extends ShardNamer {
  /**
   * Synchronously extracts Shard number from an ID. Can also extract from PG
   * composite rows (to support composite IDs).
   */
  shardNoByID(id: string): number {
    // Composite ID: `(100008888888,1023499999999)` - try extracting non-zero
    // Shard from parts (left to right) first, and if there is none, allow shard
    // zero too.
    if (typeof id === "string" && id.startsWith("(") && id.endsWith(")")) {
      let no = NaN;
      for (const subID of parseCompositeRow(id)) {
        const tryNo =
          subID && subID.length >= this.shardNoPadLen + 1
            ? parseInt(subID.substring(1, this.shardNoPadLen + 1))
            : NaN;
        if (!isNaN(tryNo)) {
          if (tryNo > 0) {
            return tryNo;
          } else if (isNaN(no)) {
            no = tryNo;
          }
        }
      }

      if (isNaN(no)) {
        const idSafe = sanitizeIDForDebugPrinting(id);
        throw Error(
          `Cannot extract shard number from the composite ID ${idSafe}`,
        );
      }

      return no;
    }

    // Plain ID.
    const no =
      typeof id === "string" && id.length >= this.shardNoPadLen + 1
        ? parseInt(id.substring(1, this.shardNoPadLen + 1))
        : NaN;
    if (isNaN(no)) {
      const idSafe = sanitizeIDForDebugPrinting(id);
      throw new ShardError(`Cannot parse ID ${idSafe} to detect shard number`);
    }

    return no;
  }
}
