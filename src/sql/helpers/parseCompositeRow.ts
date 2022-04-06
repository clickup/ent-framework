/**
 * Parses composite row input into parts. See references at:
 * - https://www.postgresql.org/docs/current/rowtypes.html
 * - https://github.com/DmitryKoterov/db_type/blob/master/lib/DB/Type/Pgsql/Row.php
 * - unit tests of this function
 */
export default function parseCompositeRow(str: string): Array<string | null> {
  let p = 0;
  let c = "";

  function readCharAfterSpaces(): string {
    while (p < str.length) {
      const c = str[p];
      if (c !== " " && c !== "\t" && c !== "\r" && c !== "\n") {
        break;
      }
    }

    return p < str.length ? str[p] : "";
  }

  function throwError(message: string) {
    throw Error(`${message} at position ${p} of "${str}"`);
  }

  // Leading "(".
  c = readCharAfterSpaces();
  if (c !== "(") {
    throwError('An anonymous composite type row must start with "("');
  }

  p++;

  // Check for immediate trailing ')': by convention, "()" translates to
  // ROW(NULL) tuple and not to an empty tuple (because ROW() and ROW(NULL) have
  // the same stringified representation which is "()" unfortunately).
  c = readCharAfterSpaces();
  if (c === ")") {
    return [null];
  }

  // Row may contain:
  // - "-quoted strings (escaping: ["] is doubled)
  // - unquoted strings (before first "," or ")")
  // - empty string (it is treated as NULL)
  // Nested rows and all other things are represented as strings.

  const reTillNext = /[^,)]*/sy;
  const reQuoted = /"((?:[^"]+|"")*)"/sy;

  const result: Array<string | null> = [];
  while (true) {
    // We read a value in this iteration, then - delimiter.
    c = readCharAfterSpaces();

    // Always read a next element value.
    if (c === "," || c === ")") {
      // Comma or end of row instead of value: treat as NULL.
      result.push(null);
    } else if (c !== '"') {
      // Unquoted string. Notice that NULL here is treated as "NULL" string, but
      // NOT as a null value! This is how composite values are encoded by PG.
      reTillNext.lastIndex = p;
      const matches = reTillNext.exec(str)!;
      result.push(matches[0]);
      p += matches[0].length;
    } else {
      reQuoted.lastIndex = p;
      const matches = reQuoted.exec(str);
      if (matches) {
        // Quoted string.
        result.push(matches[1].replace('""', '"').replace("\\\\", "\\"));
        p += matches[0].length;
      } else {
        throwError("Expected a balanced quoted string");
      }
    }

    // Delimiter or the end of row.
    c = readCharAfterSpaces();
    if (c === ",") {
      p++;
      continue;
    } else if (c === ")") {
      p++;
      break;
    } else {
      throwError('Expected a delimiter "," or ")"');
    }
  }

  return result;
}
