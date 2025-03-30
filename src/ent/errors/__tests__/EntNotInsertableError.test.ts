import { EntNotInsertableError } from "../EntNotInsertableError";

test("toStandardSchemaV1", () => {
  expect(
    JSON.stringify(
      new EntNotInsertableError("EntTest", "my-vc", {
        private: "data",
      }).toStandardSchemaV1(),
    ),
  ).not.toContain("private");
});
