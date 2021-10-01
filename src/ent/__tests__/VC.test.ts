import { VC } from "../VC";
import { createVC } from "./helpers/test-objects";

class Cache extends Map<any, any> {
  constructor() {
    super([]);
  }
}

test("VC should be able to clone", () => {
  const vc1 = createVC();
  vc1.cache(Cache).set("test", 42);
  const vc2: VC = Object.assign(Object.create(VC.prototype), vc1);
  expect(vc2.cache(Cache).get("test")).toEqual(42);
});
