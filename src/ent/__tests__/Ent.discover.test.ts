import { MASTER } from "../../abstract/Shard";
import { ShardError } from "../../abstract/ShardError";
import { join, mapJoin } from "../../helpers/misc";
import { testCluster } from "../../sql/__tests__/helpers/TestSQLClient";
import { SQLSchema } from "../../sql/SQLSchema";
import { ID } from "../../types";
import { BaseEnt } from "../BaseEnt";
import { EntNotFoundError } from "../errors/EntNotFoundError";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import { createVC } from "./helpers/test-objects";

const TABLE_DISCOVER = 'ent"discover';
const ID_FROM_UNKNOWN_SHARD = "510001234567";
const ID_FROM_EXISTING_SHARD = "500010000000";

const vc = createVC();

const schemaTestDiscover = new SQLSchema(
  TABLE_DISCOVER,
  {
    id: { type: ID, autoInsert: "id_gen()" },
    name: { type: String },
  },
  []
);

class EntTestDiscover extends BaseEnt(testCluster, schemaTestDiscover) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: [],
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [new Require(new True())],
    });
  }
}

beforeEach(async () => {
  testCluster.options.locateIslandErrorRetryCount = 2;
  testCluster.options.locateIslandErrorRetryDelayMs = 1000;

  await mapJoin(testCluster.nonGlobalShards(), async (shard) => {
    const master = await shard.client(MASTER);
    await join([
      master.rows("DROP TABLE IF EXISTS %T CASCADE", TABLE_DISCOVER),
    ]);
    await join([
      master.rows(
        `CREATE TABLE %T(
          id bigint NOT NULL,
          name text
        )`,
        TABLE_DISCOVER
      ),
    ]);
  });
});

test("shard-to-island resolution failure should be retried", async () => {
  const shard = testCluster.shard(ID_FROM_UNKNOWN_SHARD);
  const spyShardOnRunError = jest.spyOn(shard.options, "onRunError");
  await expect(
    EntTestDiscover.loadNullable(vc, ID_FROM_UNKNOWN_SHARD)
  ).rejects.toThrow(EntNotFoundError);
  expect(spyShardOnRunError).toBeCalledTimes(3);
});

test("shard relocation error when accessing a table should be retried", async () => {
  testCluster.options.locateIslandErrorRetryDelayMs = 1;

  const shard = testCluster.shard(ID_FROM_EXISTING_SHARD);
  const spyShardOnRunError = jest.spyOn(shard.options, "onRunError");

  const master = await shard.client(MASTER);
  await master.rows("DROP TABLE %T CASCADE", TABLE_DISCOVER);

  await expect(
    EntTestDiscover.loadNullable(vc, ID_FROM_EXISTING_SHARD)
  ).rejects.toThrow(ShardError);
  expect(spyShardOnRunError).toBeCalledTimes(3);
});
