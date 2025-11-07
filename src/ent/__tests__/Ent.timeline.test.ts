import { MASTER, STALE_REPLICA } from "../../abstract/Shard";
import {
  recreateTestTables,
  TEST_CONFIG,
  TEST_ISLANDS,
  testCluster,
} from "../../pg/__tests__/test-utils";
import { PgSchema } from "../../pg/PgSchema";
import { ID } from "../../types";
import { BaseEnt } from "../BaseEnt";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import { GLOBAL_SHARD } from "../ShardAffinity";
import { createVC } from "./test-utils";

jest.useFakeTimers({ advanceTimers: true });

const vc = createVC("no-cache");

class EntTestPerson extends BaseEnt(
  testCluster,
  new PgSchema(
    'ent.timeline"person',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      name: { type: String },
    },
    [],
  ),
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL,
      name text NOT NULL
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyInferPrincipal: null,
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new Require(new True())],
    });
  }
}

beforeEach(async () => {
  testCluster.options.islands = TEST_ISLANDS;
  testCluster.options.shardsDiscoverIntervalMs = 1000000;
  await testCluster.rediscover();
  await recreateTestTables([EntTestPerson]);
});

test("replication lag tracking is simulated through timestamp", async () => {
  testCluster.options.islands = [
    {
      no: 0,
      nodes: [
        { ...TEST_CONFIG, role: "master" },
        { ...TEST_CONFIG, role: "replica" },
      ],
    },
  ];
  await testCluster.rediscover();

  const master = await testCluster.shardByNo(0).client(MASTER);
  const masterQuerySpy = jest.spyOn(master, "query");
  const replica = await testCluster.shardByNo(0).client(STALE_REPLICA);
  const replicaQuerySpy = jest.spyOn(replica, "query");

  const id1 = await EntTestPerson.insert(vc, { name: "a" });
  expect(masterQuerySpy).toBeCalledTimes(1);
  expect(masterQuerySpy.mock.calls[0][0].annotations[0].whyClient).toBe(
    "master-bc-is-write",
  );

  await EntTestPerson.loadX(vc, id1);
  expect(replicaQuerySpy).toBeCalledTimes(0);
  expect(masterQuerySpy).toBeCalledTimes(2);
  expect(masterQuerySpy.mock.calls[1][0].annotations[0].whyClient).toBe(
    "master-bc-replica-not-caught-up",
  );

  await jest.advanceTimersByTimeAsync(11000);
  await EntTestPerson.loadX(vc, id1);
  expect(replicaQuerySpy).toBeCalledTimes(1);

  await jest.advanceTimersByTimeAsync(30000);
  jest.clearAllMocks();

  const id2 = await EntTestPerson.insert(vc, { name: "b" });
  expect(masterQuerySpy).toBeCalledTimes(1);
  expect(masterQuerySpy.mock.calls[0][0].annotations[0].whyClient).toBe(
    "master-bc-is-write",
  );

  await EntTestPerson.loadX(vc, id2);
  expect(replicaQuerySpy).toBeCalledTimes(0);
  expect(masterQuerySpy).toBeCalledTimes(2);
  expect(masterQuerySpy.mock.calls[1][0].annotations[0].whyClient).toBe(
    "master-bc-replica-not-caught-up",
  );
});
