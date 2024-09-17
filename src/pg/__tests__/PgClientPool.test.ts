import range from "lodash/range";
import { MASTER } from "../../abstract/Shard";
import { mapJoin } from "../../internal/misc";
import { testCluster } from "./test-utils";

test("acquireConn does not leak when release() is called", async () => {
  await mapJoin(range(1000), async (i) => {
    let conn;
    try {
      const shard = testCluster.shardByNo(2);
      const master = await shard.client(MASTER);
      conn = await master.acquireConn();
      const res = await conn.query("SELECT $1 AS i", [i]);
      expect(res.rows[0].i).toEqual(i.toString());
    } finally {
      // If we comment this out, it will blow up.
      conn?.release();
    }
  });
});
