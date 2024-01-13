import { escapeIdent } from "../helpers/escapeIdent";

/**
 * A pair for escapeComposite(), but works with a list of identifiers (e.g. list
 * of unique key fields), not with values.
 *
 * - fields=["some_id"], table="tbl"  => "tbl.some_id"
 * - fields=["f1", "f2"], table="tbl" => "(tbl.f1,tbl.f2)"
 */
export function escapeIdentComposite(
  fields: readonly string[],
  table?: string,
): string {
  const list = fields
    .map((k) => (table ? `${escapeIdent(table)}.` : "") + escapeIdent(k))
    .join(",");
  return fields.length > 1 ? `ROW(${list})` : list;
}
