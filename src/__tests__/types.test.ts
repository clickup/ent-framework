import { testSpecTypeIntegrity } from "../helpers/testSpecTypeIntegrity";
import { Base64BufferType, EnumType, JSONType } from "../types";

enum SizeStr {
  ONE = "one",
}

enum SizeNum {
  ONE = 1,
}

test("EnumType", () => {
  expect(testSpecTypeIntegrity(EnumType<"a">(), "a")).toEqual({
    jsValueDecoded: "a",
    stringifiedBack: "a",
  });
  expect(testSpecTypeIntegrity(EnumType<SizeStr>(), SizeStr.ONE)).toEqual({
    jsValueDecoded: SizeStr.ONE,
    stringifiedBack: "one",
  });
  expect(testSpecTypeIntegrity(EnumType<SizeNum>(), SizeNum.ONE)).toEqual({
    // The value comes as a number from the DB.
    jsValueDecoded: SizeNum.ONE,
    // This is a quirk: for numeric enums, stringify() returns the numeric value
    // and not a string, since this is what we expect to be stored in the DB.
    stringifiedBack: 1,
  });
});

test("Base64BufferType", () => {
  expect(testSpecTypeIntegrity(Base64BufferType(), "3q2+7w==")).toEqual({
    jsValueDecoded: Buffer.from([222, 173, 190, 239]),
    stringifiedBack: "3q2+7w==",
  });
});

test("JSONType", () => {
  expect(testSpecTypeIntegrity(JSONType<{ a: string }>(), { a: "b" })).toEqual({
    jsValueDecoded: { a: "b" },
    stringifiedBack: '{"a":"b"}',
  });
});
