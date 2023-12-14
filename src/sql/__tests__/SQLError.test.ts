import { inspect } from "util";
import { SQLError } from "../SQLError";

test("sql", () => {
  const error = new SQLError(Error("test"), "some", "SELECT 1");
  expect(inspect(error)).not.toContain("sql:");
});
