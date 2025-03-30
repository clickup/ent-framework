import { EntValidationError } from "../EntValidationError";

test("toStandardSchemaV1", () => {
  expect(
    new EntValidationError("EntTest", [
      { field: "field1", message: "message1" },
      { field: null, message: "message2" },
    ]).toStandardSchemaV1(),
  ).toEqual({
    issues: [
      { message: "message1", path: ["EntTest", "field1"] },
      { message: "message2", path: ["EntTest"] },
    ],
  });

  expect(
    new EntValidationError("", [
      { field: "field1", message: "message1" },
      { field: null, message: "message2" },
    ]).toStandardSchemaV1(),
  ).toEqual({
    issues: [
      { message: "message1", path: ["field1"] },
      { message: "message2" },
    ],
  });
});
