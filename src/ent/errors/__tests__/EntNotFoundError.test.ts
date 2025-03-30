import { EntNotFoundError } from "../EntNotFoundError";

test("toStandardSchemaV1", () => {
  expect(
    JSON.stringify(
      new EntNotFoundError("EntTest", {
        field1: "loadByField1",
        field2: "loadByField2",
      }).toStandardSchemaV1(),
    ),
  ).toContain("loadByField1"); // OK to deliver it to the client
});
