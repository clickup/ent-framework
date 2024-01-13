import { escapeString } from "./escapeString";
import { parseCompositeRow } from "./parseCompositeRow";

/**
 * PostgreSQL doesn't allow comparison like `WHERE (a, b) = '(1,2)'` - it throws
 * "Input of anonymous composite types is not implemented" error. So to compare,
 * we have to convert the stringified row representation to ROW() notation
 * manually: `WHERE (a, b) = ROW('1', '2')`
 *
 * Notice that we don't work with ROWs consisting of 1 element; instead, we
 * treat them as the element itself. I.e. instead of emitting "(123)" or
 * "ROW(123)", we always emit just "123".
 *
 * - "1" => "1"
 * - "(1)" => "1"
 * - "(1,2)" => "ROW('1','2')"
 */
export function escapeComposite(v: string | null | undefined): string {
  if (v === null || v === undefined) {
    return "NULL";
  }

  const parts =
    v.startsWith("(") && v.endsWith(")") ? parseCompositeRow(v) : [v];
  const list = parts.map((v) => escapeString(v)).join(",");
  return parts.length > 1 ? `ROW(${list})` : list;
}
