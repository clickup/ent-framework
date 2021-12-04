import { Timeline } from "../Timeline";

test("serialize and deserialize", async () => {
  const timeline = new Timeline();

  expect(timeline.serialize()).toEqual(undefined);

  timeline.setPos(BigInt(42), 10000 /* ms */);
  expect(timeline.serialize()).toEqual(
    Timeline.deserialize(timeline.serialize(), null).serialize()
  );
  expect(timeline.isCaughtUp(BigInt(50))).toBeTruthy();
  expect(timeline.isCaughtUp(BigInt(40))).not.toBeTruthy();

  timeline.setPos(BigInt(5), 10000 /* ms */); // 5 < 52, so it's a no-op
  expect(timeline.isCaughtUp(BigInt(50))).toBeTruthy();
  expect(timeline.isCaughtUp(BigInt(40))).not.toBeTruthy();
});

test("cloneMap", () => {
  const map = new Map<string, Timeline>();
  map.set("unk", new Timeline("unknown"));
  map.set("p1", new Timeline({ pos: BigInt(1), expiresAt: Date.now() }));

  const copy = Timeline.cloneMap(map);

  expect(copy.get("unk") === map.get("unk")).toBeFalsy();
  expect(copy.get("unk")).toBeUndefined();

  expect(copy.get("p1") === map.get("p1")).toBeFalsy();
  expect(copy.get("p1")!.serialize()).toEqual(map.get("p1")!.serialize());

  const prevP1Ser = map.get("p1")!.serialize();
  map.get("p1")!.setPos(BigInt(42), 42);
  expect(copy.get("p1")!.serialize()).toEqual(prevP1Ser);
});
