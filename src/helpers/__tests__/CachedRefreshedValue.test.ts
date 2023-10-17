import delay from "delay";
import pDefer from "p-defer";
import { CachedRefreshedValue } from "../CachedRefreshedValue";

const OPTIONS = {
  delayMs: 10,
  warningTimeoutMs: 1000,
  onError: () => {},
  delay: async (ms: number) => delay(ms),
};

// Ensures that the instance is destroyed after each test.
let cache: CachedRefreshedValue<unknown>;
afterEach(() => {
  cache?.destroy();
});

test("first value", async () => {
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    resolverFn: jest
      .fn()
      .mockReturnValueOnce("first")
      .mockReturnValueOnce("second")
      .mockReturnValueOnce("third"),
  });
  expect(await cache.cached()).toBe("first");
});

test("latest value", async () => {
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    resolverFn: jest
      .fn()
      .mockReturnValueOnce("first")
      .mockReturnValueOnce("second")
      .mockReturnValueOnce("third")
      .mockReturnValue("latest value"),
  });
  for (let i = 0; i < 3; i++) {
    await cache.cached();
    await delay(10);
  }

  expect(await cache.cached()).toBe("latest value");
});

test("error swallowing", async () => {
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    resolverFn: jest
      .fn()
      .mockRejectedValueOnce(new Error("Error"))
      .mockReturnValue("after error"),
  });
  expect(await cache.cached()).toBe("after error");
});

test("error handler", async () => {
  const err = new Error("Error");
  const onError = jest.fn();
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    onError,
    resolverFn: jest.fn().mockRejectedValueOnce(err).mockReturnValue("first"),
  });
  await cache.cached();
  expect(onError).toBeCalledWith(err);
});

test("eventual consistency", async () => {
  const slowFn = jest.fn();
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    resolverFn: jest
      .fn()
      .mockImplementationOnce(async () => {
        await delay(2000); // longer than delayMs
        slowFn();
        return "timed out value";
      })
      .mockReturnValue("first"),
  });
  await cache.cached();
  await delay(1000);
  expect(await cache.cached()).toBe("first");
  expect(slowFn).toBeCalled();
});

test("timeout warning", async () => {
  const deferred = pDefer();
  const onError = jest.fn();
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    onError,
    warningTimeoutMs: 100,
    resolverFn: async () => deferred.promise,
  });
  const promise = cache.cached();
  await delay(200);
  deferred.resolve("first");
  await promise;
  expect(onError.mock.lastCall).toMatchInlineSnapshot(`
    [
      [Error: CachedRefreshedValue.: Warning: resolverFn did not complete in 100ms!],
    ]
  `);
});

test("custom delay handler", async () => {
  const delayFn = jest.fn().mockImplementation(async (ms: number) => delay(ms));
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    resolverFn: jest.fn().mockReturnValue("foo"),
    delay: delayFn,
    delayMs: 10,
  });
  await cache.cached();
  expect(delayFn).toBeCalledWith(10);
});

test("throwing in onError during timeout", async () => {
  const deferred = pDefer();
  const onError = jest.fn().mockImplementation(() => {
    throw new Error("Error in onError");
  });
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    onError,
    warningTimeoutMs: 100,
    resolverFn: async () => deferred.promise,
  });
  const promise = cache.cached();
  await delay(200);
  deferred.resolve("first");
  await promise;
  expect(onError.mock.lastCall).toMatchInlineSnapshot(`
    [
      [Error: CachedRefreshedValue.: Warning: resolverFn did not complete in 100ms!],
    ]
  `);
});

test("throwing in onError during error", async () => {
  const onError = jest.fn().mockImplementation(() => {
    throw new Error("Error in onError");
  });
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    onError,
    resolverFn: jest
      .fn()
      .mockRejectedValueOnce(new Error("Errored in resolverFn"))
      .mockResolvedValueOnce("value"),
  });
  await cache.cached();
  expect(onError.mock.lastCall).toMatchInlineSnapshot(`
    [
      [Error: Errored in resolverFn],
    ]
  `);
});

test("waitRefresh()", async () => {
  let i = 0;
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    resolverFn: jest.fn().mockImplementation(async () => {
      await delay(500);
      return `delayed ${i++}`;
    }),
  });
  await cache.waitRefresh();
  expect(await cache.cached()).toBe("delayed 1");
  await cache.waitRefresh();
  expect(await cache.cached()).toBe("delayed 2");
  await cache.waitRefresh();
  expect(await cache.cached()).toBe("delayed 3");
});

test("destroy before cached()", async () => {
  cache = new CachedRefreshedValue({ ...OPTIONS, resolverFn: jest.fn() });
  cache.destroy();
  await expect(cache.cached()).rejects.toMatchInlineSnapshot(
    "[Error: CachedRefreshedValue: This instance is destroyed]"
  );
});

test("destroy before waitRefresh()", async () => {
  cache = new CachedRefreshedValue({ ...OPTIONS, resolverFn: jest.fn() });
  cache.destroy();
  await expect(cache.waitRefresh()).rejects.toMatchInlineSnapshot(
    "[Error: CachedRefreshedValue: This instance is destroyed]"
  );
});

test("destroy after cached()", async () => {
  cache = new CachedRefreshedValue({ ...OPTIONS, resolverFn: jest.fn() });
  await cache.cached();
  cache.destroy();
  await expect(cache.cached()).rejects.toMatchInlineSnapshot(
    "[Error: CachedRefreshedValue: This instance is destroyed]"
  );
});

test("destroy after waitRefresh()", async () => {
  cache = new CachedRefreshedValue({ ...OPTIONS, resolverFn: jest.fn() });
  await cache.waitRefresh();
  cache.destroy();
  await expect(cache.waitRefresh()).rejects.toMatchInlineSnapshot(
    "[Error: CachedRefreshedValue: This instance is destroyed]"
  );
});

test("destroy stops resolverFn() calls", async () => {
  const resolverFn = jest.fn().mockResolvedValue("foo");
  cache = new CachedRefreshedValue({ ...OPTIONS, resolverFn });
  await cache.cached();
  cache.destroy();
  await delay(OPTIONS.delayMs * 5);
  expect(resolverFn).toBeCalledTimes(1);
});

test("waitRefresh() returns fresh value", async () => {
  let resolveDeferred = pDefer();
  let delayDeferred = pDefer();
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    resolverFn: async () => {
      const val = await resolveDeferred.promise;
      resolveDeferred = pDefer();
      return val;
    },
    delay: async () => {
      await delayDeferred.promise;
      delayDeferred = pDefer();
    },
  });

  resolveDeferred.resolve("init");
  await cache.cached();

  await delay(1000);

  const freshValue = cache.waitRefresh().then(async () => cache.cached());
  delayDeferred.resolve();
  resolveDeferred.resolve("fresh");
  expect(await freshValue).toBe("fresh");
});

test("waitRefresh() skips in-flight value", async () => {
  let resolveCalled = pDefer();
  let resolveDeferred = pDefer();
  let delayDeferred = pDefer();
  cache = new CachedRefreshedValue({
    ...OPTIONS,
    resolverFn: async () => {
      resolveCalled.resolve();
      resolveCalled = pDefer();
      const val = await resolveDeferred.promise;
      resolveDeferred = pDefer();
      return val;
    },
    delay: async () => {
      await delayDeferred.promise;
      delayDeferred = pDefer();
    },
  });

  resolveDeferred.resolve("init");
  await cache.cached();

  delayDeferred.resolve();
  await resolveCalled.promise;
  const freshValue = cache.waitRefresh().then(async () => cache.cached());

  resolveDeferred.resolve("in-flight");
  delayDeferred.resolve();

  await resolveCalled.promise;
  resolveDeferred.resolve("fresh");

  expect(await freshValue).toBe("fresh");
});
