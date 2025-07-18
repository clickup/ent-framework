import { testSpecTypeIntegrity } from "../../../helpers/testSpecTypeIntegrity";
import { StringArrayType } from "../StringArrayType";

test("sanity", () => {
  expect(
    testSpecTypeIntegrity(StringArrayType(), [
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
    testSpecTypeIntegrity(StringArrayType(), [
      "abc",
      null,
      null,
      "null",
      "NULL",
    ]),
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
  expect(testSpecTypeIntegrity(StringArrayType(), [null]))
    .toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        null,
      ],
      "stringifiedBack": "{NULL}",
    }
  `);
});

test("non-nullable type", () => {
  expect(testSpecTypeIntegrity(StringArrayType<string>(), ["abc"]))
    .toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        "abc",
      ],
      "stringifiedBack": "{"abc"}",
    }
  `);
});

test("enum and literal type", () => {
  enum MyEnum {
    A = "a",
  }

  expect(testSpecTypeIntegrity(StringArrayType<MyEnum>(), [MyEnum.A]))
    .toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        "a",
      ],
      "stringifiedBack": "{"a"}",
    }
  `);

  expect(testSpecTypeIntegrity(StringArrayType<"a" | "b">(), ["a"]))
    .toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        "a",
      ],
      "stringifiedBack": "{"a"}",
    }
  `);
});
