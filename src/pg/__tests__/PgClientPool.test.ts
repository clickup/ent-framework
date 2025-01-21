import range from "lodash/range";
import { MASTER } from "../../abstract/Shard";
import { mapJoin } from "../../internal/misc";
import { PgClientPool, type PgClientPoolOptions } from "../PgClientPool";
import { testCluster } from "./test-utils";

let options: PgClientPoolOptions;

beforeEach(async () => {
  options = (await testCluster.globalShard().client(MASTER)).options;
});

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

test("static role=master", async () => {
  const client = new PgClientPool({
    ...options,
    role: "master",
    maxReplicationLagMs: undefined,
  });
  await client.query({
    query: ["SELECT 1"],
    isWrite: true,
    annotations: [],
    op: "",
    table: "",
  });
  expect(client.options.maxReplicationLagMs).toBeLessThan(10000);
  expect(await client.timelineManager.currentPos()).toEqual(BigInt(1));
  expect(client.role()).toEqual("master");
});

test("static role=replica", async () => {
  const client = new PgClientPool({
    ...options,
    role: "replica",
    maxReplicationLagMs: 20000,
  });
  await client.query({
    query: ["SELECT 1"],
    isWrite: false,
    annotations: [],
    op: "",
    table: "",
  });
  expect(await client.timelineManager.currentPos()).toEqual(BigInt(0));
  expect(client.role()).toEqual("replica");
});

test("dynamic role=unknown", async () => {
  const client = new PgClientPool({ ...options, role: "unknown" });
  await client.query({
    query: ["SELECT 1"],
    isWrite: false,
    annotations: [],
    op: "",
    table: "",
  });
  expect(await client.timelineManager.currentPos()).toBeGreaterThan(BigInt(1));
  expect(client.role()).toEqual("master");
});
