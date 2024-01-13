/**
 * Escapes a boolean as PG string literal.
 */
export function escapeBoolean(v: boolean | null | undefined): string {
  return v === null || v === undefined ? "NULL" : v ? "true" : "false";
}
