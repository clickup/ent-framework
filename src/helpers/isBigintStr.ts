const MAX_BIGINT = "9223372036854775807";
const MAX_BIGINT_RE = new RegExp("^\\d{1," + MAX_BIGINT.length + "}$");

/**
 * It's hard to support PG bigint type in JS, so people use strings instead.
 * This function checks that a string can be passed to PG as a bigint.
 */
export function isBigintStr(str: string): boolean {
  return (
    !!str.match(MAX_BIGINT_RE) &&
    (str.length < MAX_BIGINT.length || str <= MAX_BIGINT)
  );
}
