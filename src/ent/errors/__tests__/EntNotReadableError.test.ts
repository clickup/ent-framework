import type { RowWithID } from "../../../types";
import { EntNotReadableError } from "../EntNotReadableError";

test("toStandardSchemaV1", () => {
  expect(
    JSON.stringify(
      new EntNotReadableError("EntTest", "my-vc", {
        id: "42",
        private: "data",
      } as RowWithID).toStandardSchemaV1(),
    ),
  ).not.toContain("private");
});
