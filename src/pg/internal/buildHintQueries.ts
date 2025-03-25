import type { Hints } from "../../types";

export const RAW_PREPEND_HINT = "";

/**
 * Builds query prologue queries for the given hints.
 *
 * In the resulting compound queries, the returned `queries` will become a part
 * of the debug query text, and queriesDefault will be prepended and omitted
 * from the debug query text.
 *
 * Also, if there is a special hint with key = "", the its value is appended as
 * it is to the very beginning of the compound query sent. You can e.g. pass
 * pg_hint_plan extension hints there.
 */
export function buildHintQueries(
  hintsDefault: Readonly<Hints> = {},
  hints: Readonly<Hints> = {},
): [rawPrepend: string, queriesDefault: string[], queries: string[]] {
  const queriesDefault: string[] = [];
  const queries: string[] = [];

  const rawPrepend = hints[RAW_PREPEND_HINT] ?? "";

  for (const k in hintsDefault) {
    const v = hintsDefault[k];
    if (k === RAW_PREPEND_HINT) {
      continue;
    } else if (v === null || v === undefined) {
      // Engine default or non-set.
      continue;
    } else if (hints[k] !== undefined) {
      // User sets this hint to some different value (or resets it).
      continue;
    } else {
      queriesDefault.push(buildHintQuery(k, v));
    }
  }

  for (const k in hints) {
    const v = hints[k];
    if (k === RAW_PREPEND_HINT) {
      continue;
    } else if (v === null || v === undefined) {
      // Engine default or non-set.
      continue;
    } else {
      queries.push(buildHintQuery(k, v));
    }
  }

  return [rawPrepend, queriesDefault, queries];
}

function buildHintQuery(k: string, v: string): string {
  return k.toLowerCase() === "transaction"
    ? `SET LOCAL ${k} ${v}`
    : `SET LOCAL ${k} TO ${v}`;
}
