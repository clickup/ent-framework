import { RAW_PREPEND_HINT, buildHintQueries } from "../buildHintQueries";

test("no hints", () => {
  expect(buildHintQueries({}, {})).toEqual(["", [], []]);
  expect(buildHintQueries(undefined, undefined)).toEqual(["", [], []]);
});

test("no user hints", () => {
  expect(
    buildHintQueries(
      { statement_timeout: "10000", transaction: "read only" },
      {},
    ),
  ).toEqual([
    "",
    ["SET LOCAL statement_timeout TO 10000", "SET LOCAL transaction read only"],
    [],
  ]);
});

test("user overrides a hint", () => {
  expect(
    buildHintQueries(
      { statement_timeout: "10000", transaction: "read only" },
      { statement_timeout: "42" },
    ),
  ).toEqual([
    "",
    ["SET LOCAL transaction read only"],
    ["SET LOCAL statement_timeout TO 42"],
  ]);
});

test("user resets a hint", () => {
  expect(
    buildHintQueries(
      { statement_timeout: "10000", transaction: "read only" },
      { transaction: null },
    ),
  ).toEqual(["", ["SET LOCAL statement_timeout TO 10000"], []]);
});

test('user passes undefined aka "no key mentioned"', () => {
  expect(
    buildHintQueries(
      { statement_timeout: "10000", transaction: "read only" },
      { transaction: undefined },
    ),
  ).toEqual([
    "",
    ["SET LOCAL statement_timeout TO 10000", "SET LOCAL transaction read only"],
    [],
  ]);
});

test("raw prepend hint", () => {
  expect(
    buildHintQueries(undefined, {
      statement_timeout: "42",
      [RAW_PREPEND_HINT]: "/*+IndexScan(my_table)*/",
    }),
  ).toEqual([
    "/*+IndexScan(my_table)*/ ",
    [],
    ["SET LOCAL statement_timeout TO 42"],
  ]);
});

test('default passes undefined aka "no key mentioned"', () => {
  expect(buildHintQueries({ statement_timeout: undefined }, {})).toEqual([
    "",
    [],
    [],
  ]);
  expect(
    buildHintQueries(
      { statement_timeout: undefined },
      { statement_timeout: null },
    ),
  ).toEqual(["", [], []]);
  expect(
    buildHintQueries(
      { statement_timeout: undefined },
      { statement_timeout: undefined },
    ),
  ).toEqual(["", [], []]);
  expect(
    buildHintQueries(
      { statement_timeout: undefined },
      { statement_timeout: "42" },
    ),
  ).toEqual(["", [], ["SET LOCAL statement_timeout TO 42"]]);
});

test("default resets a hint", () => {
  expect(buildHintQueries({ statement_timeout: null }, {})).toEqual([
    "",
    [],
    [],
  ]);
  expect(
    buildHintQueries({ statement_timeout: null }, { statement_timeout: null }),
  ).toEqual(["", [], []]);
  expect(
    buildHintQueries(
      { statement_timeout: null },
      { statement_timeout: undefined },
    ),
  ).toEqual(["", [], []]);
  expect(
    buildHintQueries({ statement_timeout: null }, { statement_timeout: "42" }),
  ).toEqual(["", [], ["SET LOCAL statement_timeout TO 42"]]);
});
