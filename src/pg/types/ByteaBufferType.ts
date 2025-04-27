import { types } from "pg";

/**
 * A value stored in the DB as a bytea buffer.
 */
export function ByteaBufferType(): {
  dbValueToJs: (dbValue: Buffer) => Buffer;
  stringify: (jsValue: Buffer) => string;
  parse: (str: string) => Buffer;
} {
  return {
    // Node-postgres returns bytea values as Buffer already.
    dbValueToJs: (dbValue) => dbValue,

    // PG's representation: '\xDEADBEEF'
    stringify: (jsValue) => "\\x" + jsValue.toString("hex"),

    parse: (str) => types.getTypeParser(types.builtins.BYTEA)(str) as Buffer,
  };
}
