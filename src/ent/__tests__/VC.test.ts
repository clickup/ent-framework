/* eslint-disable @typescript-eslint/no-explicit-any */
import { VC } from "../VC";
import { VCFlavor } from "../VCFlavor";
import { createVC } from "./test-utils";

class Cache extends Map<unknown, unknown> {
  constructor() {
    super([]);
  }
}

class VCTest1 extends VCFlavor {
  constructor(public value: string) {
    super();
  }

  override toDebugString(): string {
    return `VCTest1:${this.value}`;
  }
}

class VCTest2 extends VCFlavor {
  constructor(public value: string) {
    super();
  }

  override toDebugString(): string {
    return `VCTest2:${this.value}`;
  }
}

test("VC should be able to clone", () => {
  const vc1 = createVC();
  vc1.cache(Cache).set("test", 42);
  const vc2: VC = Object.assign(Object.create(VC.prototype), vc1);
  expect(vc2.cache(Cache).get("test")).toEqual(42);
});

test("root flag of the VC is changed", () => {
  const vc1root = createVC() as VC;
  expect((vc1root as any).isRoot).toBeTruthy();

  const vc2root = vc1root.toOmniDangerous();
  expect((vc2root as any).isRoot).toBeTruthy();
  expect(
    (vc2root as any).timelines === (vc1root as any).timelines
  ).toBeTruthy();

  const vc3 = vc1root.toLowerInternal("42");
  expect((vc3 as any).isRoot).toBeFalsy();
  expect((vc3 as any).timelines === (vc1root as any).timelines).toBeFalsy();

  const vc4 = vc2root.toLowerInternal("42");
  expect((vc4 as any).isRoot).toBeFalsy();
  expect((vc4 as any).timelines === (vc2root as any).timelines).toBeFalsy();

  const vc5 = vc4.toLowerInternal(null); // -> guest
  expect((vc5 as any).isRoot).toBeFalsy();
  expect((vc5 as any).timelines === (vc4 as any).timelines).toBeTruthy();

  const vc6 = vc5.toLowerInternal("11"); // -> other user
  expect((vc6 as any).isRoot).toBeFalsy();
  expect((vc6 as any).timelines === (vc5 as any).timelines).toBeTruthy();
});

test("VC flavor prepend and append", () => {
  const vc = createVC().withFlavor(new VCTest1("some"));
  const vc2 = vc.withFlavor(new VCTest2("t2"));
  expect(vc2.toString()).toEqual("vc:guest(VCTest1:some,VCTest2:t2)");
  expect(vc2.withFlavor(new VCTest2("tNew")).toString()).toEqual(
    "vc:guest(VCTest1:some,VCTest2:tNew)"
  );
  expect(vc2.withFlavor("prepend", new VCTest2("tNew")).toString()).toEqual(
    "vc:guest(VCTest2:tNew,VCTest1:some)"
  );
});
