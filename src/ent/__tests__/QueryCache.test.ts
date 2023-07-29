import { testCluster } from "../../sql/__tests__/test-utils";
import { SQLSchema } from "../../sql/SQLSchema";
import { BaseEnt, GLOBAL_SHARD } from "../BaseEnt";
import { True } from "../predicates/True";
import { QueryCache } from "../QueryCache";
import { AllowIf } from "../rules/AllowIf";
import { createVC } from "./test-utils";

export class EntTestCompany extends BaseEnt(
  testCluster,
  new SQLSchema(
    'query-cache"company',
    {
      id: { type: String, autoInsert: "id_gen()" },
      name: { type: String },
    },
    ["name"]
  )
) {
  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyLoad: [new AllowIf(new True())],
      privacyInsert: [],
    });
  }
}

test("simple deletion", async () => {
  const vc = createVC();
  const cache = vc.cache(QueryCache);

  await cache.through(EntTestCompany, "select", "key", async () => "res1");

  const res1 = await cache.through(
    EntTestCompany,
    "select",
    "key",
    async () => "other"
  );
  expect(res1).toEqual("res1");

  cache.delete(EntTestCompany, ["select"]);

  const res2 = await cache.through(
    EntTestCompany,
    "select",
    "key",
    async () => "other"
  );
  expect(res2).toEqual("other");
});
