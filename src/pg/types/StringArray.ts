import { types } from "pg";

/**
 * It is in pg-types/lib/textParsers.js (1015::regtype is "character
 * varying[]"), just not exported to TS types.
 */
const VARCHAR_ARRAY_OID = 1015;

/**
 * An array of Strings. Note: node-postgres natively supports this type on read
 * path, but on write path, we have to stringify by ourselves.
 */
export function StringArray(): {
  dbValueToJs: (dbValue: Array<string | null>) => Array<string | null>;
  stringify: (jsValue: Array<string | null>) => string;
  parse: (str: string) => Array<string | null>;
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

    parse: (str) =>
      types.getTypeParser(VARCHAR_ARRAY_OID)(str) as Array<string | null>,
  };
}
