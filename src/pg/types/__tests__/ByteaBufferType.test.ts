import { testSpecTypeIntegrity } from "../../../helpers/testSpecTypeIntegrity";
import { ByteaBufferType } from "../ByteaBufferType";

test("sanity", () => {
  expect(
    testSpecTypeIntegrity(ByteaBufferType(), Buffer.from("DEADBEEF", "hex")),
  ).toMatchInlineSnapshot(`
    {
      "jsValueDecoded": {
        "data": [
          222,
          173,
          190,
          239,
        ],
        "type": "Buffer",
      },
      "stringifiedBack": "\\xdeadbeef",
    }
  `);
});
