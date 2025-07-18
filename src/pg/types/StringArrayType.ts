import { types } from "pg";
import type { DesperateAny } from "../../internal/misc";

/**
 * It is in pg-types/lib/textParsers.js (1015::regtype is "character
 * varying[]"), just not exported to TS types.
 */
const VARCHAR_ARRAY_OID: DesperateAny = 1015;

/**
 * An array of Strings. Note: node-postgres natively supports this type on read
 * path, but on write path, we have to stringify by ourselves.
 */
export function StringArrayType<T extends string | null = string | null>(): {
  dbValueToJs: (dbValue: T[]) => T[];
  stringify: (jsValue: T[]) => string;
  parse: (str: string) => T[];
} {
  return {
    dbValueToJs: (dbValue) => dbValue,

    stringify: (jsValue) =>
      "{" +
      jsValue
        .map((v) =>
          v === null
            ? "NULL"
            : `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
        )
        .join(",") +
      "}",

    parse: (str) => types.getTypeParser(VARCHAR_ARRAY_OID)(str) as T[],
  };
}
