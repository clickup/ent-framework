import { testSpecTypeIntegrity } from "../../../helpers/testSpecTypeIntegrity";
import { ByteaBuffer } from "../ByteaBuffer";

test("sanity", () => {
  expect(testSpecTypeIntegrity(ByteaBuffer(), Buffer.from("DEADBEEF", "hex")))
    .toMatchInlineSnapshot(`
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
