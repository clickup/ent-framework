import { MASTER } from "..";
import { join } from "../../internal/misc";
import {
  TCPProxyServer,
  TEST_CONFIG,
  testCluster,
} from "../../pg/__tests__/test-utils";

jest.useFakeTimers({ advanceTimers: true });

let connStuckServer: TCPProxyServer;

beforeEach(async () => {
  connStuckServer = new TCPProxyServer({
    host: TEST_CONFIG.host!,
    port: TEST_CONFIG.port!,
    delayOnConnect: 1000000,
  });
});

afterEach(async () => {
  testCluster.options.islands = [{ no: 0, nodes: [TEST_CONFIG] }];
  testCluster.options.shardsDiscoverIntervalMs = 1000000;
  testCluster.options.shardsDiscoverRecheckIslandsIntervalMs = 50;
  await testCluster.rediscover();
});

test("Shard is not discoverable error when connection got stuck", async () => {
  const STUCK_CONFIG = {
    ...TEST_CONFIG,
    host: connStuckServer.address().address,
    port: connStuckServer.address().port,
    connectionTimeoutMillis: 5000,
  };
  testCluster.options.islands = [
    {
      no: 0,
      nodes: [
        { ...STUCK_CONFIG, isAlwaysLaggingReplica: false, nameSuffix: "0" },
        { ...STUCK_CONFIG, isAlwaysLaggingReplica: true, nameSuffix: "0" },
      ],
    },
    {
      no: 1,
      nodes: [{ ...STUCK_CONFIG, nameSuffix: "1" }],
    },
  ];

  const shard = testCluster.shardByNo(0);

  const error1 = await join([
    jest.advanceTimersByTimeAsync(120000),
    shard.client(MASTER),
  ])
    .then(() => null)
    .catch((error: Error) => error.toString());
  expect(error1?.replace(/\d{3,}/g, "NNN")).toMatchSnapshot();

  const error2 = await shard
    .client(MASTER)
    .then(() => null)
    .catch((error: Error) => error.toString());
  expect(error2?.replace(/\d{3,}/g, "NNN")).toMatchSnapshot();
});

test("Shard is not discoverable error when no such shard", async () => {
  const shard = testCluster.shardByNo(1000);
  const error = await shard
    .client(MASTER)
    .then(() => null)
    .catch((error) => error.toString() as string);
  expect(error?.replace(/\d{3,}/g, "NNN")).toEqual(
    "ShardIsNotDiscoverableError: Shard NNN is not discoverable: no such Shard in the Cluster? some Islands are down? connections limit?",
  );
});
