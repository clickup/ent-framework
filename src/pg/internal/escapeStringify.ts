import { escapeString } from "./escapeString";

/**
 * A helper method which additionally calls to a stringify() function before
 * escaping the value as string.
 */
export function escapeStringify(
  v: unknown,
  stringify: (v: unknown) => string,
): string {
  return v === null || v === undefined ? "NULL" : escapeString(stringify(v));
}
