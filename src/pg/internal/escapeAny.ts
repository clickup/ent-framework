import { escapeArray } from "./escapeArray";
import { escapeBoolean } from "./escapeBoolean";
import { escapeDate } from "./escapeDate";
import { escapeString } from "./escapeString";

/**
 * Tries its best to escape the value according to its type.
 *
 * Try to not use this function; although it protects against SQL injections,
 * it's not aware of the actual field type, so it e.g. cannot prevent a bigint
 * overflow SQL error.
 */
export function escapeAny(v: unknown): string {
  return v === null || v === undefined
    ? "NULL"
    : typeof v === "number"
      ? v.toString()
      : typeof v === "boolean"
        ? escapeBoolean(v)
        : v instanceof Date
          ? escapeDate(v)
          : v instanceof Array
            ? escapeArray(v)
            : escapeString(v as string | null | undefined);
}
