import { testSpecTypeIntegrity } from "../../../helpers/testSpecTypeIntegrity";
import { StringArray } from "../StringArray";

test("sanity", () => {
  expect(
    testSpecTypeIntegrity(StringArray(), [
      "a",
      null,
      'a"b"c',
      "a\\n",
      "a\nb\nc",
    ]),
  ).toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        "a",
        null,
        "a"b"c",
        "a\\n",
        "a
    b
    c",
      ],
      "stringifiedBack": "{"a",NULL,"a\\"b\\"c","a\\\\n","a^nb^nc"}",
    }
  `);
});

test("nulls", () => {
  expect(
    testSpecTypeIntegrity(StringArray(), ["abc", null, null, "null", "NULL"]),
  ).toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        "abc",
        null,
        null,
        "null",
        "NULL",
      ],
      "stringifiedBack": "{"abc",NULL,NULL,"null","NULL"}",
    }
  `);
  expect(testSpecTypeIntegrity(StringArray(), [null])).toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        null,
      ],
      "stringifiedBack": "{NULL}",
    }
  `);
});
