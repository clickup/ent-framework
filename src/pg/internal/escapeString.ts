/**
 * Escapes a string as PG string literal.
 */
export function escapeString(v: string | null | undefined): string {
  return v === null || v === undefined
    ? "NULL"
    : // Postgres doesn't like ASCII NUL character (error message is "unterminated
      // quoted string" or "invalid message format"), so we remove it too.
      "'" + ("" + v).replace(/\0/g, "").replace(/'/g, "''") + "'";
}
