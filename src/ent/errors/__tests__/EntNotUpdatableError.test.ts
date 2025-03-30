import type { RowWithID } from "../../../types";
import { EntNotUpdatableError } from "../EntNotUpdatableError";

test("toStandardSchemaV1", () => {
  expect(
    JSON.stringify(
      new EntNotUpdatableError("EntTest", "my-vc", {
        id: "42",
        private: "data",
      } as RowWithID).toStandardSchemaV1(),
    ),
  ).not.toContain("private");
});
