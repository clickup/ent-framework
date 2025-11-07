import { inspectCompact } from "../../internal/misc";
import { PgError } from "../PgError";

test("sql", () => {
  const error = new PgError(Error("test"), "some", "SELECT 1", "mytable");
  expect(inspectCompact(error)).not.toContain("sql:");
  expect(inspectCompact(error.message)).not.toContain("mytable");
  expect(error.table).toEqual("mytable");
  expect(error.sql).toEqual("SELECT 1");
});
