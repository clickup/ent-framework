import { inspect } from "util";
import { SQLError } from "../SQLError";

test("sql", () => {
  const error = new SQLError(new Error("test"), "my_dest", "SELECT 1");
  expect(inspect(error)).not.toContain("sql:");
});
