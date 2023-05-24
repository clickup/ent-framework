import delay from "delay";
import waitForExpect from "wait-for-expect";
import { WeakTicker } from "../WeakTicker";

class Target {
  constructor(private ticksOut: number[], public maxTicks: number) {}

  onTick(tickNo: number): "keep" | "unschedule" {
    this.ticksOut.push(tickNo);
    return tickNo < this.maxTicks - 1 ? "keep" : "unschedule";
  }
}

test("schedules a tick", async () => {
  const weakTicker = new WeakTicker();
  const ticks: number[] = [];
  const target = new Target(ticks, 2);
  weakTicker.schedule(target, 10);
  await waitForExpect(() => expect(ticks).toEqual([0, 1]));
  expect(weakTicker.isEmpty()).toBeTruthy();
});

test("rescheduling clears tick number", async () => {
  const weakTicker = new WeakTicker();
  const ticks: number[] = [];
  const target = new Target(ticks, Number.MAX_SAFE_INTEGER);
  weakTicker.schedule(target, 10);
  await waitForExpect(() => expect(ticks.length).toBeGreaterThan(5));
  weakTicker.schedule(target, 10);
  await waitForExpect(() =>
    expect(ticks.filter((v) => v === 0)).toEqual([0, 0])
  );
});

(typeof global.gc === "function" ? test : test.skip)(
  "does not retain target",
  async () => {
    const weakTicker = new WeakTicker();
    const ticks: number[] = [];
    let target: Target | null = new Target(ticks, Number.MAX_SAFE_INTEGER);
    weakTicker.schedule(target, 10);
    target = null;
    await delay(10);
    global.gc!();
    await waitForExpect(() => expect(weakTicker.isEmpty()).toBeTruthy());
  }
);
