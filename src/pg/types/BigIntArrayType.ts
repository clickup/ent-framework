import { types } from "pg";
import type { DesperateAny } from "../../internal/misc";

/**
 * It is in pg-types/lib/textParsers.js (1016::regtype is "bigint[]"), just not
 * exported to TS types.
 */
const BIGINT_ARRAY_OID: DesperateAny = 1016;

/**
 * An array of IDs. Notice that:
 * 1. Node-postgres natively supports this type on read path, but on write path,
 *    we have to stringify by ourselves.
 * 2. GIN index doesn't support NULL, because PG's "&&" operator (intersection
 *    check) doesn't work with NULLs. But we still allow NULLs in BigIntArrayType,
 *    because to query such values, we can use a separate partial index.
 */
export function BigIntArrayType(): {
  dbValueToJs: (dbValue: Array<string | null>) => Array<string | null>;
  stringify: (jsValue: Array<string | null>) => string;
  parse: (str: string) => Array<string | null>;
} {
  return {
    dbValueToJs: (dbValue) => dbValue,

    // PG's representation: '{123,NULL,NULL,223}'. Notice that the unquoted NULL
    // must be of a capital case to denote a null value, otherwise it's treated
    // as a 4-char string "null". This is a part of the protocol.
    stringify: (jsValue) =>
      "{" + jsValue.map((v) => v ?? "NULL").join(",") + "}",

    parse: (str) =>
      types.getTypeParser(BIGINT_ARRAY_OID)(str) as Array<string | null>,
  };
}
