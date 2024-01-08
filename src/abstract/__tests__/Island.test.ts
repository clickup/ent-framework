import type { Client } from "../Client";
import { Island } from "../Island";

const client1 = {
  options: { name: "client1" },
  isMaster: () => true,
  isConnectionIssue: () => false,
} as Client;
const client2 = {
  options: { name: "client2" },
  isMaster: () => false,
  isConnectionIssue: () => false,
} as Client;
const client3 = {
  options: { name: "client3" },
  isMaster: () => false,
  isConnectionIssue: () => false,
} as Client;

test("fails on an empty island", async () => {
  expect(() => new Island([])).toThrowError();
});

test("returns 1st client if it's the only one", async () => {
  const island = new Island([client1]);
  expect(island.master()).toBe(client1);
  expect(island.replica()).toBe(client1);
});

test("returns replica client", async () => {
  const island = new Island([client1, client2]);
  expect(island.master()).toBe(client1);
  expect(island.replica()).toBe(client2);
});

test("returns master if replica is unhealthy", async () => {
  const island = new Island([client1, client2]);
  jest.spyOn(client2, "isConnectionIssue").mockReturnValue(true);
  expect(island.replica()).toBe(client1);
});

test("returns master if both replicas are unhealthy", async () => {
  const island = new Island([client1, client2, client3]);
  jest.spyOn(client2, "isConnectionIssue").mockReturnValue(true);
  jest.spyOn(client3, "isConnectionIssue").mockReturnValue(true);
  expect(island.replica()).toBe(client1);
});

test("returns another replica is one is unhealthy", async () => {
  const island = new Island([client1, client2, client3]);
  jest.spyOn(client2, "isConnectionIssue").mockReturnValue(true);
  expect(island.replica()).toBe(client3);
});

test("returns master if both master and replica are unhealthy", async () => {
  const island = new Island([client1, client2]);
  jest.spyOn(client1, "isConnectionIssue").mockReturnValue(true);
  jest.spyOn(client2, "isConnectionIssue").mockReturnValue(true);
  expect(island.replica()).toBe(client1);
});

test("if there are two masters reported, return the healthy one", async () => {
  const island = new Island([client1, client2]);
  jest.spyOn(client1, "isMaster").mockReturnValue(true);
  jest.spyOn(client1, "isConnectionIssue").mockReturnValue(true);
  jest.spyOn(client2, "isMaster").mockReturnValue(true);
  jest.spyOn(client2, "isConnectionIssue").mockReturnValue(false);
  expect(island.replica()).toBe(client2);
  expect(island.master()).toBe(client2);
});

test("returns replica as master if there is no master", async () => {
  const island = new Island([client2, client3]);
  expect(island.master()).toBe(client2);
  jest.spyOn(client2, "isConnectionIssue").mockReturnValue(true);
  expect(island.master()).toBe(client3);
});
