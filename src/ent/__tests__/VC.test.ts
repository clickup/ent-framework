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

test("Root flag of the VC is changed", () => {
  const vc1root = createVC();
  expect((vc1root as any).isRoot).toBeTruthy();

  const vc2root = vc1root.toOmniDangerous();
  expect((vc2root as any).isRoot).toBeTruthy();
  expect((vc2root as any).sessions === (vc1root as any).sessions).toBeTruthy();

  const vc3 = vc1root.toLowerInternal("42");
  expect((vc3 as any).isRoot).toBeFalsy();
  expect((vc3 as any).sessions === (vc1root as any).sessions).toBeFalsy();

  const vc4 = vc2root.toLowerInternal("42");
  expect((vc4 as any).isRoot).toBeFalsy();
  expect((vc4 as any).sessions === (vc2root as any).sessions).toBeFalsy();

  const vc5 = vc4.toLowerInternal(null); // -> guest
  expect((vc5 as any).isRoot).toBeFalsy();
  expect((vc5 as any).sessions === (vc4 as any).sessions).toBeTruthy();

  const vc6 = vc5.toLowerInternal("11"); // -> other user
  expect((vc6 as any).isRoot).toBeFalsy();
  expect((vc6 as any).sessions === (vc5 as any).sessions).toBeTruthy();
});
