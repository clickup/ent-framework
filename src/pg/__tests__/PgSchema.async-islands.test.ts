import delay from "delay";
import first from "lodash/first";
import uniq from "lodash/uniq";
import waitForExpect from "wait-for-expect";
import { maybeCall } from "../../internal/misc";
import { TEST_CONFIG, testCluster } from "./test-utils";

jest.useFakeTimers({ advanceTimers: true });

let nodesFn: () => Promise<Array<typeof TEST_CONFIG>>;

beforeEach(async () => {
  nodesFn = async () => [TEST_CONFIG];
  testCluster.options.shardsDiscoverIntervalMs = 20000;
  testCluster.options.reloadIslandsIntervalMs = 100;
  testCluster.options.islands = async () => [{ no: 0, nodes: await nodesFn() }];

  // Resolve all long delay() calls from the previous tests, to not let them
  // stuck the cluster rediscover() below.
  jest.advanceTimersByTime(2_000_000);

  await testCluster.rediscover();
  expect(first(await testCluster.islands())!.clients).toHaveLength(1);
});

test("when 2nd call to Cluster#options.islands is slow, it doesn't block rediscovery", async () => {
  let reloadIslandsEntered = false;
  let reloadIslandsExited = false;
  nodesFn = async () =>
    delay(1)
      .then(() => (reloadIslandsEntered = true))
      .then(async () => delay(1_000_000))
      .then(() => (reloadIslandsExited = true))
      .then(() => [TEST_CONFIG, TEST_CONFIG]);

  // Make sure the long delay code got triggered.
  await jest.advanceTimersByTimeAsync(1000);
  expect(reloadIslandsEntered).toBeTruthy();

  // Still uses the cached Islands quickly, even though the new run of
  // `options.islands()` is very slow.
  await jest.advanceTimersByTimeAsync(
    maybeCall(testCluster.options.shardsDiscoverIntervalMs) * 4,
  );
  expect(reloadIslandsExited).toBeFalsy();
  expect(first(await testCluster.islands())!.clients).toHaveLength(1);

  // Eventually, uses the updated Islands.
  await jest.advanceTimersByTimeAsync(1_200_000);
  await waitForExpect(
    async () =>
      expect(
        first(await testCluster.islands())!.clients.map(
          (c) => c.options.config,
        ),
      ).toHaveLength(2),
    10000,
  );
});

test("when 2nd call to Cluster#options.islands throws, it doesn't block rediscovery", async () => {
  let reloadIslandsEntered = false;
  let reloadIslandsThrew = false;
  nodesFn = async () =>
    delay(1)
      .then(() => (reloadIslandsEntered = true))
      .then(async () => delay(10_000))
      .then(() => (reloadIslandsThrew = true))
      .then(async () =>
        Promise.reject(new Error("Fake error in options.islands()")),
      );

  // Make sure the long delay code got triggered.
  await jest.advanceTimersByTimeAsync(1000);
  expect(reloadIslandsEntered).toBeTruthy();
  expect(reloadIslandsThrew).toBeFalsy();

  // Despite `options.islands()` threw, we are still able to use the old cache.
  await jest.advanceTimersByTimeAsync(12000);
  expect(reloadIslandsThrew).toBeTruthy();
  const errors = uniq(
    jest
      .mocked(testCluster.options.loggers.swallowedErrorLogger!)
      .mock.calls.map((call) => "" + call[0].error),
  ).join("\n");
  expect(errors).toContain("Fake error");
  expect(errors).toContain("islands() did not complete in");

  await testCluster.rediscover("shards");
  expect(
    first(await testCluster.islands())!.clients.map((c) => c.options.config),
  ).toHaveLength(1);
});
