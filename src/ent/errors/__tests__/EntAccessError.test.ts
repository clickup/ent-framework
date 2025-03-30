import { EntAccessError } from "../EntAccessError";

test("toStandardSchemaV1", () => {
  expect(
    new EntAccessError("EntTest", "my-message").toStandardSchemaV1(),
  ).toEqual({
    issues: [{ message: "my-message", path: ["EntTest"] }],
  });

  expect(new EntAccessError("", "my-message").toStandardSchemaV1()).toEqual({
    issues: [{ message: "my-message" }],
  });

  expect(
    JSON.stringify(
      new EntAccessError(
        "EntTest",
        "my-message",
        "my-cause",
      ).toStandardSchemaV1(),
    ),
  ).toContain("my-cause");
});
