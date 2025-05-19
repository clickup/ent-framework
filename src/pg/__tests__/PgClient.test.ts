import range from "lodash/range";
import { MASTER } from "../../abstract/Shard";
import { mapJoin } from "../../internal/misc";
import { PgClient, type PgClientOptions } from "../PgClient";
import { testCluster } from "./test-utils";

let options: PgClientOptions;

beforeEach(async () => {
  options = (await testCluster.globalShard().client(MASTER)).options;
});

test("custom Pool implementation is type safe", async () => {
  const master = await testCluster.shardByNo(2).client(MASTER);
  expect(master.pool().some()).toEqual("some");
});

test("sub-pools are distinct", async () => {
  const master = await testCluster.shardByNo(2).client(MASTER);
  const client = new PgClient(master.options);

  const defaultPool = client.pool();
  const subPoolA = client.pool({ name: "a" });
  const subPoolB = client.pool({ name: "b" });

  expect(subPoolA).toBe(client.pool({ name: "a", max: 42 }));
  expect(subPoolA).not.toBe(subPoolB);
  expect(subPoolA).not.toBe(defaultPool);

  let conn;
  try {
    conn = await client.acquireConn({ name: "a" });
    expect(subPoolA.totalCount).toEqual(1);
    expect(subPoolB.totalCount).toEqual(0);
    expect(defaultPool.totalCount).toEqual(0);
  } finally {
    conn?.release();
  }

  await client.end();
  expect(subPoolA.totalCount).toEqual(0);
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
  const client = new PgClient({
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
  const client = new PgClient({
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
  const client = new PgClient({ ...options, role: "unknown" });
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
