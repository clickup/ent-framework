const RE_COMMENT = toRegExp`
  /\*.*?\*/
`;

const RE_NUMBER = toRegExp`
  (?<!\w)\d+
`;

const RE_STRING = toRegExp`
  ' (?:[^']|'')* '
`;

const RE_IN_ROW = toRegExp`
  (
    \sIN\(
    ROW \( [^)]+ \)
  )
  (?: ,\s* ROW \( [^)]+ \) )*
`;

const RE_VALUES = toRegExp`
  ^(
    (?: WITH \s [^\n]+ | [^\n]+ \s WHERE [^\n]+ \s IN\( )
    VALUES\n
    [^\n]+,\n
    ( \s* \( (?:[^\n]+) \) )
  ),\n
    (?: \2 (?:,\n)? )+
`;

const RE_INSERT_VALUES = toRegExp`
  ^(
    INSERT \s INTO \s [^\n]+VALUES\n
      ( \s* \( (?:[^\n]+) \) )
  ),\n
    (?: \2 (?:,\n)? )+
`;

const RE_IDENTICAL_UNION_ALL = toRegExp`
  (?<=^|\n)
  ( \(? SELECT \s .*? )\n
  (?:
    (\s* UNION \s ALL)\n
    \1 \n?
  )+
`;

/**
 * Extracts a "shape" from some commonly built SQL queries. This function may be
 * used from the outside for logging/debugging, so it's here, not in __tests__.
 */
export function buildShape(sql: string): string {
  return sql
    .trim()
    .replace(RE_COMMENT, "")
    .replace(RE_NUMBER, "?")
    .replace(RE_STRING, "'?'")
    .replace(RE_IN_ROW, "$1, ...")
    .replace(RE_VALUES, "$1, ...")
    .replace(RE_INSERT_VALUES, "$1, ...")
    .replace(RE_IDENTICAL_UNION_ALL, "$1\n$2 ...");
}

function toRegExp(template: TemplateStringsArray): RegExp {
  return new RegExp(template.raw.join("").replace(/\s+/g, ""), "g");
}
