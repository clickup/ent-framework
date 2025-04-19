import assert, { AssertionError } from "assert";

/**
 * A tool to verify integrity of custom field types. It is meant to be called
 * from Jest expect(). The helper runs dbValueToJs, stringify and parse methods
 * on the type and makes sure that parse() is the opposite of stringify(). The
 * returned object can then be compared against a Jest snapshot.
 */
export function testSpecTypeIntegrity<TDBValue, TJsValue>(
  SpecType: {
    dbValueToJs: (dbValue: TDBValue) => TJsValue;
    stringify: (jsValue: TJsValue) => string;
    parse: (str: string) => TJsValue;
  },
  dbValue: TDBValue,
): {
  jsValueDecoded: TJsValue;
  stringifiedBack: string;
} {
  const jsValue = SpecType.dbValueToJs(dbValue);
  const str = SpecType.stringify(jsValue);
  const parsed = SpecType.parse(str);

  const error1 = new AssertionError({
    actual: str,
    expected: SpecType.stringify(parsed),
  });
  assert(
    JSON.stringify(error1.actual) === JSON.stringify(error1.expected),
    error1,
  );

  const error2 = new AssertionError({
    actual: jsValue,
    expected: parsed,
  });
  assert(
    JSON.stringify(error2.actual) === JSON.stringify(error2.expected),
    error2,
  );

  return {
    jsValueDecoded: jsValue,
    stringifiedBack: typeof str === "string" ? str.replace(/\n/g, "^n") : str,
  };
}
