import { QueryCache } from "../QueryCache";
import { VCWithQueryCache } from "../VCFlavor";
import { EntTestCompany, vcTestGuest } from "./helpers/test-objects";

function createVC() {
  const vc = vcTestGuest.withFlavor(new VCWithQueryCache({ maxQueries: 1000 }));
  (vc as any).freshness = null;
  return vc;
}

test("simple delete works", async () => {
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
