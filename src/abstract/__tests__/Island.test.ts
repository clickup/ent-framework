import { testCluster } from "../../pg/__tests__/test-utils";
import type { Client, ClientConnectionIssue } from "../Client";
import { Island } from "../Island";

const CLIENT1 = {
  options: { name: "client1" },
  role: () => "master",
  connectionIssue: () => null,
} as Client;

const CLIENT2 = {
  options: { name: "client2" },
  role: () => "replica",
  connectionIssue: () => null,
} as Client;

const CLIENT3 = {
  options: { name: "client3" },
  role: () => "replica",
  connectionIssue: () => null,
} as Client;

const ISLAND_OPTIONS = {
  no: 0,
  createShard: () => testCluster.globalShard(),
};

const CONNECTION_ISSUE: ClientConnectionIssue = {
  timestamp: new Date(),
  cause: Error("test"),
  postAction: "fail",
  kind: "data-on-server-is-unchanged",
  comment: "test",
};

test("fails on an empty island", async () => {
  expect(() => new Island({ ...ISLAND_OPTIONS, clients: [] })).toThrowError();
});

test("returns 1st client if it's the only one", async () => {
  const island = new Island({ ...ISLAND_OPTIONS, clients: [CLIENT1] });
  expect(island.master()).toBe(CLIENT1);
  expect(island.replica()).toBe(CLIENT1);
});

test("returns master and replica", async () => {
  const island = new Island({ ...ISLAND_OPTIONS, clients: [CLIENT1, CLIENT2] });
  expect(island.master()).toBe(CLIENT1);
  expect(island.replica()).toBe(CLIENT2);
});

test("replica() returns master if replica is unhealthy", async () => {
  const island = new Island({ ...ISLAND_OPTIONS, clients: [CLIENT1, CLIENT2] });
  jest.spyOn(CLIENT2, "connectionIssue").mockReturnValue(CONNECTION_ISSUE);
  expect(island.replica()).toBe(CLIENT1);
});

test("replica() returns master if both replicas are unhealthy", async () => {
  const island = new Island({
    ...ISLAND_OPTIONS,
    clients: [CLIENT1, CLIENT2, CLIENT3],
  });
  jest.spyOn(CLIENT2, "connectionIssue").mockReturnValue(CONNECTION_ISSUE);
  jest.spyOn(CLIENT3, "connectionIssue").mockReturnValue(CONNECTION_ISSUE);
  expect(island.replica()).toBe(CLIENT1);
});

test("replica() returns another replica is one is unhealthy", async () => {
  const island = new Island({
    ...ISLAND_OPTIONS,
    clients: [CLIENT1, CLIENT2, CLIENT3],
  });
  jest.spyOn(CLIENT2, "connectionIssue").mockReturnValue(CONNECTION_ISSUE);
  expect(island.replica()).toBe(CLIENT3);
});

test("replica() returns replica if both master and replica are unhealthy", async () => {
  const island = new Island({ ...ISLAND_OPTIONS, clients: [CLIENT1, CLIENT2] });
  jest.spyOn(CLIENT1, "connectionIssue").mockReturnValue(CONNECTION_ISSUE);
  jest.spyOn(CLIENT2, "connectionIssue").mockReturnValue(CONNECTION_ISSUE);
  expect(island.master()).toBe(CLIENT1);
  expect(island.replica()).toBe(CLIENT2);
});

test("if there are two masters reported, master() return the healthy one", async () => {
  const island = new Island({ ...ISLAND_OPTIONS, clients: [CLIENT1, CLIENT2] });
  jest.spyOn(CLIENT1, "role").mockReturnValue("master");
  jest.spyOn(CLIENT1, "connectionIssue").mockReturnValue(CONNECTION_ISSUE);
  jest.spyOn(CLIENT2, "role").mockReturnValue("master");
  jest.spyOn(CLIENT2, "connectionIssue").mockReturnValue(null);
  expect(island.replica()).toBe(CLIENT2);
  expect(island.master()).toBe(CLIENT2);
});

test("master() always returns known master, even if it's unhealthy", async () => {
  const island = new Island({ ...ISLAND_OPTIONS, clients: [CLIENT1, CLIENT2] });
  jest.spyOn(CLIENT1, "connectionIssue").mockReturnValue(CONNECTION_ISSUE);
  expect(island.master()).toBe(CLIENT1);
});

test("master() returns replica as master if there is no master at all", async () => {
  const island = new Island({ ...ISLAND_OPTIONS, clients: [CLIENT2, CLIENT3] });
  jest.spyOn(CLIENT2, "connectionIssue").mockReturnValue(CONNECTION_ISSUE);
  expect(island.master()).toBe(CLIENT3);
});

test("master() returns unknown node as master if all other nodes reported themselves as replicas", async () => {
  jest.spyOn(CLIENT1, "role").mockReturnValue("replica");
  jest.spyOn(CLIENT2, "role").mockReturnValue("replica");
  jest.spyOn(CLIENT3, "role").mockReturnValue("unknown");
  const island = new Island({
    ...ISLAND_OPTIONS,
    clients: [CLIENT1, CLIENT2, CLIENT3],
  });
  expect(island.master()).toBe(CLIENT3);
  jest.spyOn(CLIENT3, "connectionIssue").mockReturnValue(CONNECTION_ISSUE);
  expect(island.master()).toBe(CLIENT3);
});

test("master() and replica() still work when nodes switch suddenly after reclassification", async () => {
  const island = new Island({ ...ISLAND_OPTIONS, clients: [CLIENT1, CLIENT2] });
  jest.spyOn(CLIENT1, "role").mockReturnValue("replica");
  jest.spyOn(CLIENT2, "role").mockReturnValue("master");
  expect(island.master()).toBe(CLIENT2);
  expect(island.replica()).toBe(CLIENT1);
});
