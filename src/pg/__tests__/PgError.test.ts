import { inspect } from "util";
import { PgError } from "../PgError";

test("sql", () => {
  const error = new PgError(Error("test"), "some", "SELECT 1");
  expect(inspect(error)).not.toContain("sql:");
});
