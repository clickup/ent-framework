import { testSpecTypeIntegrity } from "../../../helpers/testSpecTypeIntegrity";
import { BigIntArrayType } from "../BigIntArrayType";

test("sanity", () => {
  expect(
    testSpecTypeIntegrity(BigIntArrayType(), ["5012413060896574870", "123"]),
  ).toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        "5012413060896574870",
        "123",
      ],
      "stringifiedBack": "{5012413060896574870,123}",
    }
  `);
});

test("nulls", () => {
  expect(testSpecTypeIntegrity(BigIntArrayType(), ["123", null, null, "234"]))
    .toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        "123",
        null,
        null,
        "234",
      ],
      "stringifiedBack": "{123,NULL,NULL,234}",
    }
  `);
  expect(testSpecTypeIntegrity(BigIntArrayType(), [null]))
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
  expect(testSpecTypeIntegrity(BigIntArrayType<string>(), ["123"]))
    .toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        "123",
      ],
      "stringifiedBack": "{123}",
    }
  `);
});
