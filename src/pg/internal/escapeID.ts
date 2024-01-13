import { isBigintStr } from "../../helpers/isBigintStr";
import { escapeString } from "./escapeString";

/**
 * Escapes a value implying that it's a PG ID (which is a bigint). This should
 * be a preferred way of escaping when we know that the value is a bigint.
 */
export function escapeID(v: string | null | undefined): string {
  if (v === null || v === undefined) {
    return "NULL";
  }

  const str = "" + v;
  if (!isBigintStr(str)) {
    return "'-1'/*bad_bigint*/";
  }

  return escapeString(str);
}
