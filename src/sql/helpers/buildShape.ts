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

const RE_WITH_VALUES = toRegExp`
  ^(
    WITH \s [^\n]+VALUES\n
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

export default function buildShape(sql: string) {
  return sql
    .trim()
    .replace(RE_COMMENT, "")
    .replace(RE_NUMBER, "?")
    .replace(RE_STRING, "'?'")
    .replace(RE_IN_ROW, "$1, ...")
    .replace(RE_WITH_VALUES, "$1, ...")
    .replace(RE_INSERT_VALUES, "$1, ...")
    .replace(RE_IDENTICAL_UNION_ALL, "$1\n$2 ...");
}

function toRegExp(template: TemplateStringsArray) {
  return new RegExp(template.raw.join("").replace(/\s+/g, ""), "g");
}
