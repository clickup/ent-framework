/**
 * Optionally encloses a PG identifier (like table name) in "".
 */
export function escapeIdent(ident: string): string {
  return ident.match(/^[a-z_][a-z_0-9]*$/is)
    ? ident
    : '"' + ident.replace(/"/g, '""') + '"';
}
