import { testSpecTypeIntegrity } from "../helpers/testSpecTypeIntegrity";
import { Base64Buffer, Enum } from "../types";

enum SizeStr {
  ONE = "one",
}

enum SizeNum {
  ONE = 1,
}

test("Enum", () => {
  expect(testSpecTypeIntegrity(Enum<"a">(), "a")).toEqual({
    jsValueDecoded: "a",
    stringifiedBack: "a",
  });
  expect(testSpecTypeIntegrity(Enum<SizeStr>(), SizeStr.ONE)).toEqual({
    jsValueDecoded: SizeStr.ONE,
    stringifiedBack: "one",
  });
  expect(testSpecTypeIntegrity(Enum<SizeNum>(), SizeNum.ONE)).toEqual({
    // The value comes as a number from the DB.
    jsValueDecoded: SizeNum.ONE,
    // This is a quirk: for numeric enums, stringify() returns the numeric value
    // and not a string, since this is what we expect to be stored in the DB.
    stringifiedBack: 1,
  });
});

test("Base64Buffer", () => {
  expect(testSpecTypeIntegrity(Base64Buffer(), "3q2+7w=="))
    .toMatchInlineSnapshot(`
      {
        "jsValueDecoded": {
          "data": [
            222,
            173,
            190,
            239,
          ],
          "type": "Buffer",
        },
        "stringifiedBack": "3q2+7w==",
      }
    `);
});
