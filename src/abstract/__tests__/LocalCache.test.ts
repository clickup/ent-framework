import delay from "delay";
import waitForExpect from "wait-for-expect";
import { LocalCache } from "../LocalCache";

jest.useFakeTimers({ advanceTimers: true });

test("writes and reads", async () => {
  const KEY = `key${Date.now()}`;

  const cache = new LocalCache<{ some: string }>({
    dir: "/tmp/ent-framework-local-cache-test",
    loggers: { swallowedErrorLogger: () => {} },
    expirationMs: 1000000,
  });
  expect(await cache.get(KEY)).toBeNull();

  await cache.set(KEY, { some: "42" });
  await delay(100);
  expect(await cache.get(KEY)).toEqual({ some: "42" });

  await cache.set(KEY, { some: "101" });
  await delay(100);
  expect(await cache.get(KEY)).toEqual({ some: "101" });

  jest.advanceTimersByTime(cache.options.cleanupFirstRunDelayMs * 2);
  jest.advanceTimersByTime(cache.options.expirationMs);

  await waitForExpect(async () => expect(await cache.get(KEY)).toBeNull());
});
