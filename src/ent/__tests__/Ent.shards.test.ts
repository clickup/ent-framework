import { MASTER } from "../../abstract/Shard";
import {
  recreateTestTables,
  testCluster,
} from "../../sql/__tests__/test-utils";
import { SQLSchema } from "../../sql/SQLSchema";
import { ID } from "../../types";
import { BaseEnt, GLOBAL_SHARD } from "../BaseEnt";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import { createVC } from "./test-utils";

const ID_FROM_EXISTING_SHARD = "500010000000";
const ID_FROM_UNKNOWN_SHARD = "511110000000";
const PARENT_ID_FROM_UNKNOWN_SHARD = "511117654321";
const UNIVERSE_FROM_UNKNOWN_SHARD = "511119999999";

const vc = createVC();

class EntTestUniverse extends BaseEnt(
  testCluster,
  new SQLSchema(
    'ent.discover"universe',
    { id: { type: ID, autoInsert: "id_gen()" } },
    []
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new Require(new True())],
    });
  }
}

class EntTestHuman extends BaseEnt(
  testCluster,
  new SQLSchema(
    'ent.discover"human',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      parent_id: { type: ID },
      universe_id: { type: ID, allowNull: true },
      name: { type: String },
    },
    []
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL,
      parent_id bigint NOT NULL,
      universe_id bigint,
      name text
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: ["parent_id"],
      inverses: {
        universe_id: { name: "inverses", type: "universe2humans" },
      },
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new Require(new True())],
    });
  }
}

beforeEach(async () => {
  await recreateTestTables([EntTestUniverse, EntTestHuman]);

  testCluster.options.locateIslandErrorRetryCount = 2;
  testCluster.options.locateIslandErrorRetryDelayMs = 1000;
});

test("unknown shard failure, singleShardFromID", async () => {
  const shard = testCluster.shard(ID_FROM_UNKNOWN_SHARD);
  const spyShardOnRunError = jest.spyOn(shard.options, "onRunError");
  await expect(
    EntTestHuman.loadNullable(vc, ID_FROM_UNKNOWN_SHARD)
  ).rejects.toThrowErrorMatchingSnapshot();
  expect(spyShardOnRunError).toBeCalledTimes(1); // not retried on intent
});

test("unknown shard failure, singleShardForInsert", async () => {
  const shard = testCluster.shard(PARENT_ID_FROM_UNKNOWN_SHARD);
  const spyShardOnRunError = jest.spyOn(shard.options, "onRunError");
  await expect(
    EntTestHuman.insertIfNotExists(vc, {
      parent_id: PARENT_ID_FROM_UNKNOWN_SHARD,
      universe_id: null,
      name: "test",
    })
  ).rejects.toThrowErrorMatchingSnapshot();
  expect(spyShardOnRunError).toBeCalledTimes(1); // not retried on intent
});

test("unknown shard failure, multiShardsFromInput, no inverses", async () => {
  await expect(
    EntTestHuman.select(vc, { universe_id: UNIVERSE_FROM_UNKNOWN_SHARD }, 1)
  ).rejects.toThrowErrorMatchingSnapshot();
});

test("shard relocation error when accessing a table should be retried", async () => {
  testCluster.options.locateIslandErrorRetryDelayMs = 1;

  const shard = testCluster.shard(ID_FROM_EXISTING_SHARD);
  const spyShardOnRunError = jest.spyOn(shard.options, "onRunError");

  const master = await shard.client(MASTER);
  await master.rows("DROP TABLE %T CASCADE", EntTestHuman.SCHEMA.name);

  await expect(
    EntTestHuman.loadNullable(vc, ID_FROM_EXISTING_SHARD)
  ).rejects.toThrow(/undefined_table/);
  expect(spyShardOnRunError).toBeCalledTimes(3);
});
