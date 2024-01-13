/**
 * Escapes a date as PG string literal.
 */
export function escapeDate(v: Date | null | undefined, field?: string): string {
  try {
    return v === null || v === undefined ? "NULL" : "'" + v.toISOString() + "'";
  } catch (e: unknown) {
    throw Error(`Failed to perform escapeDate for "${field}": ${e}`);
  }
}
