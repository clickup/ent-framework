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

  timeline.setPos(BigInt(101), 1 /* ms */);
  await new Promise((r) => setTimeout(r, 100));
  expect(timeline.serialize()).toEqual(undefined);
});
