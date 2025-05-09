import { inspectCompact } from "../../internal/misc";
import { PgError } from "../PgError";

test("sql", () => {
  const error = new PgError(Error("test"), "some", "SELECT 1");
  expect(inspectCompact(error)).not.toContain("sql:");
});
