import { testSpecTypeIntegrity } from "../../../helpers/testSpecTypeIntegrity";
import { BigIntArray } from "../BigIntArray";

test("sanity", () => {
  expect(testSpecTypeIntegrity(BigIntArray(), ["5012413060896574870", "123"]))
    .toMatchInlineSnapshot(`
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
  expect(testSpecTypeIntegrity(BigIntArray(), ["123", null, null, "234"]))
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
  expect(testSpecTypeIntegrity(BigIntArray(), [null])).toMatchInlineSnapshot(`
    {
      "jsValueDecoded": [
        null,
      ],
      "stringifiedBack": "{NULL}",
    }
  `);
});
