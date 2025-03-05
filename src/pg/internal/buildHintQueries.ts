import type { Hints } from "../../types";

/**
 * Builds query prologue queries for the given hints.
 *
 * In the resulting compound queries, the returned `queries` will become a part
 * of the debug query text, and queriesDefault will be prepended and omitted
 * from the debug query text.
 */
export function buildHintQueries(
  hintsDefault: Readonly<Hints> = {},
  hints: Readonly<Hints> = {},
): [queriesDefault: string[], queries: string[]] {
  const queriesDefault: string[] = [];
  const queries: string[] = [];

  for (const k in hintsDefault) {
    const v = hintsDefault[k];
    if (v === null || v === undefined) {
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
    if (v === null || v === undefined) {
      // Engine default or non-set.
      continue;
    } else {
      queries.push(buildHintQuery(k, v));
    }
  }

  return [queriesDefault, queries];
}

function buildHintQuery(k: string, v: string): string {
  return k.toLowerCase() === "transaction"
    ? `SET LOCAL ${k} ${v}`
    : `SET LOCAL ${k} TO ${v}`;
}
