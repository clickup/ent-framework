import { deepEqual } from "../deepEqual";

test("equal numbers", () => expect(deepEqual(1, 1)).toBe(true));

test("not equal numbers", () => expect(deepEqual(1, 2)).toBe(false));

test("number and array are not equal", () =>
  expect(deepEqual(1, [])).toBe(false));

test("0 and null are not equal", () => expect(deepEqual(0, null)).toBe(false));

test("equal strings", () => expect(deepEqual("a", "a")).toBe(true));

test("not equal strings", () => expect(deepEqual("a", "b")).toBe(false));

test("empty string and null are not equal", () =>
  expect(deepEqual("", null)).toBe(false));

test("null is equal to null", () => expect(deepEqual(null, null)).toBe(true));

test("equal booleans (true)", () => expect(deepEqual(true, true)).toBe(true));

test("equal booleans (false)", () =>
  expect(deepEqual(false, false)).toBe(true));

test("not equal booleans", () => expect(deepEqual(true, false)).toBe(false));

test("1 and true are not equal", () => expect(deepEqual(1, true)).toBe(false));

test("0 and false are not equal", () =>
  expect(deepEqual(0, false)).toBe(false));

test("NaN and NaN are equal", () => expect(deepEqual(NaN, NaN)).toBe(true));

test("0 and -0 are equal", () => expect(deepEqual(0, -0)).toBe(true));

test("Infinity and Infinity are equal", () =>
  expect(deepEqual(Infinity, Infinity)).toBe(true));

test("Infinity and -Infinity are not equal", () =>
  expect(deepEqual(Infinity, -Infinity)).toBe(false));

test("empty objects are equal", () => expect(deepEqual({}, {})).toBe(true));

test('equal objects (same properties "order")', () =>
  expect(deepEqual({ a: 1, b: "2" }, { a: 1, b: "2" })).toBe(true));

test('equal objects (different properties "order")', () =>
  expect(deepEqual({ a: 1, b: "2" }, { b: "2", a: 1 })).toBe(true));

test("not equal objects (extra property)", () =>
  expect(deepEqual({ a: 1, b: "2" }, { a: 1, b: "2", c: [] })).toBe(false));

test("not equal objects (different property values)", () =>
  expect(deepEqual({ a: 1, b: "2", c: 3 }, { a: 1, b: "2", c: 4 })).toBe(
    false
  ));

test("not equal objects (different properties)", () =>
  expect(deepEqual({ a: 1, b: "2", c: 3 }, { a: 1, b: "2", d: 3 })).toBe(
    false
  ));

test("equal objects (same sub-properties)", () =>
  expect(deepEqual({ a: [{ b: "c" }] }, { a: [{ b: "c" }] })).toBe(true));

test("not equal objects (different sub-property value)", () =>
  expect(deepEqual({ a: [{ b: "c" }] }, { a: [{ b: "d" }] })).toBe(false));

test("not equal objects (different sub-property)", () =>
  expect(deepEqual({ a: [{ b: "c" }] }, { a: [{ c: "c" }] })).toBe(false));

test("empty array and empty object are not equal", () =>
  expect(deepEqual({}, [])).toBe(false));

test("object with extra undefined properties are equal #1", () =>
  expect(deepEqual({}, { foo: undefined })).toBe(true));

test("object with extra undefined properties are equal #2", () =>
  expect(deepEqual({ foo: undefined }, {})).toBe(true));

test("object with extra undefined properties are equal #3", () =>
  expect(deepEqual({ foo: undefined }, { bar: undefined })).toBe(true));

test("nulls are equal", () => expect(deepEqual(null, null)).toBe(true));

test("null and undefined are not equal", () =>
  expect(deepEqual(null, undefined)).toBe(false));

test("null and empty object are not equal", () =>
  expect(deepEqual(null, {})).toBe(false));

test("undefined and empty object are not equal", () =>
  expect(deepEqual(undefined, {})).toBe(false));

test("objects with different `toString` functions returning same values are equal", () =>
  expect(
    deepEqual(
      { toString: () => "Hello world!" },
      { toString: () => "Hello world!" }
    )
  ).toBe(true));

test("objects with `toString` functions returning different values are not equal", () =>
  expect(
    deepEqual({ toString: () => "Hello world!" }, { toString: () => "Hi!" })
  ).toBe(false));

test("two empty arrays are equal", () => expect(deepEqual([], [])).toBe(true));

test("equal arrays", () => expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true));

test("not equal arrays (different item)", () =>
  expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false));

test("not equal arrays (different length)", () =>
  expect(deepEqual([1, 2, 3], [1, 2])).toBe(false));

test("equal arrays of objects", () =>
  expect(deepEqual([{ a: "a" }, { b: "b" }], [{ a: "a" }, { b: "b" }])).toBe(
    true
  ));

test("not equal arrays of objects", () =>
  expect(deepEqual([{ a: "a" }, { b: "b" }], [{ a: "a" }, { b: "c" }])).toBe(
    false
  ));

test("pseudo array and equivalent array are not equal", () =>
  expect(deepEqual({ "0": 0, "1": 1, length: 2 }, [0, 1])).toBe(false));

test("equal date objects", () =>
  expect(
    deepEqual(
      new Date("2017-06-16T21:36:48.362Z"),
      new Date("2017-06-16T21:36:48.362Z")
    )
  ).toBe(true));

test("not equal date objects", () =>
  expect(
    deepEqual(
      new Date("2017-06-16T21:36:48.362Z"),
      new Date("2017-01-01T00:00:00.000Z")
    )
  ).toBe(false));

test("date and string are not equal", () =>
  expect(
    deepEqual(new Date("2017-06-16T21:36:48.362Z"), "2017-06-16T21:36:48.362Z")
  ).toBe(false));

test("date and object are not equal", () =>
  expect(deepEqual(new Date("2017-06-16T21:36:48.362Z"), {})).toBe(false));

test("equal RegExp objects", () => expect(deepEqual(/foo/, /foo/)).toBe(true));

test("not equal RegExp objects (different pattern)", () =>
  expect(deepEqual(/foo/, /bar/)).toBe(false));

test("not equal RegExp objects (different flags)", () =>
  expect(deepEqual(/foo/, /foo/i)).toBe(false));

test("RegExp and string are not equal", () =>
  expect(deepEqual(/foo/, "foo")).toBe(false));

test("RegExp and object are not equal", () =>
  expect(deepEqual(/foo/, {})).toBe(false));

test("same function is equal", () =>
  expect(deepEqual(func1, func1)).toBe(true));

test("different functions are not equal", () =>
  expect(deepEqual(func1, func2)).toBe(false));

test("big object", () =>
  expect(
    deepEqual(
      {
        prop1: "value1",
        prop2: "value2",
        prop3: "value3",
        prop4: {
          subProp1: "sub value1",
          subProp2: {
            subSubProp1: "sub sub value1",
            subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5],
          },
        },
        prop5: 1000,
        prop6: new Date(2016, 2, 10),
      },
      {
        prop5: 1000,
        prop3: "value3",
        prop1: "value1",
        prop2: "value2",
        prop6: new Date("2016/03/10"),
        prop4: {
          subProp2: {
            subSubProp1: "sub sub value1",
            subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5],
          },
          subProp1: "sub value1",
        },
      }
    )
  ).toBe(true));

test("equal numbers", () => expect(deepEqual(1, 1)).toBe(true));

test("equal bigints", () => expect(deepEqual(BigInt(1), BigInt(1))).toBe(true));

test("not equal bigints", () =>
  expect(deepEqual(BigInt(1), BigInt(2))).toBe(false));

test("empty maps are equal", () =>
  expect(deepEqual(new Map(), new Map())).toBe(true));

test("empty maps of different class are not equal", () =>
  expect(deepEqual(new Map(), new MyMap())).toBe(false));

test('equal maps (same key "order")', () =>
  expect(deepEqual(map({ a: 1, b: "2" }), map({ a: 1, b: "2" }))).toBe(true));

test('not equal maps (same key "order" - instances of different classes)', () =>
  expect(deepEqual(map({ a: 1, b: "2" }), myMap({ a: 1, b: "2" }))).toBe(
    false
  ));

test('equal maps (different key "order")', () =>
  expect(deepEqual(map({ a: 1, b: "2" }), map({ b: "2", a: 1 }))).toBe(true));

test('equal maps (different key "order" - instances of the same subclass)', () =>
  expect(deepEqual(myMap({ a: 1, b: "2" }), myMap({ b: "2", a: 1 }))).toBe(
    true
  ));

test("not equal maps (extra key)", () =>
  expect(deepEqual(map({ a: 1, b: "2" }), map({ a: 1, b: "2", c: [] }))).toBe(
    false
  ));

test("not equal maps (different key value)", () =>
  expect(
    deepEqual(map({ a: 1, b: "2", c: 3 }), map({ a: 1, b: "2", c: 4 }))
  ).toBe(false));

test("not equal maps (different keys)", () =>
  expect(
    deepEqual(map({ a: 1, b: "2", c: 3 }), map({ a: 1, b: "2", d: 3 }))
  ).toBe(false));

test("equal maps (same sub-keys)", () =>
  expect(
    deepEqual(map({ a: [map({ b: "c" })] }), map({ a: [map({ b: "c" })] }))
  ).toBe(true));

test("not equal maps (different sub-key value)", () =>
  expect(
    deepEqual(map({ a: [map({ b: "c" })] }), map({ a: [map({ b: "d" })] }))
  ).toBe(false));

test("not equal maps (different sub-key)", () =>
  expect(
    deepEqual(map({ a: [map({ b: "c" })] }), map({ a: [map({ c: "c" })] }))
  ).toBe(false));

test("empty map and empty object are not equal", () =>
  expect(deepEqual({}, new Map())).toBe(false));

test("map with extra undefined key is not equal #1", () =>
  expect(deepEqual(map({}), map({ foo: undefined }))).toBe(false));

test("map with extra undefined key is not equal #2", () =>
  expect(deepEqual(map({ foo: undefined }), map({}))).toBe(false));

test("maps with extra undefined keys are not equal #3", () =>
  expect(deepEqual(map({ foo: undefined }), map({ bar: undefined }))).toBe(
    false
  ));

test("null and empty map are not equal", () =>
  expect(deepEqual(null, new Map())).toBe(false));

test("undefined and empty map are not equal", () =>
  expect(deepEqual(undefined, new Map())).toBe(false));

test("map and a pseudo map are not equal", () =>
  expect(
    deepEqual(map({}), {
      constructor: Map,
      size: 0,
      has: () => true,
      get: () => 1,
    })
  ).toBe(false));

test("empty sets are equal", () =>
  expect(deepEqual(new Set(), new Set())).toBe(true));

test("empty sets of different class are not equal", () =>
  expect(deepEqual(new Set(), new MySet())).toBe(false));

test('equal sets (same value "order")', () =>
  expect(deepEqual(set(["a", "b"]), set(["a", "b"]))).toBe(true));

test('not equal sets (same value "order" - instances of different classes)', () =>
  expect(deepEqual(set(["a", "b"]), mySet(["a", "b"]))).toBe(false));

test('equal sets (different value "order")', () =>
  expect(deepEqual(set(["a", "b"]), set(["b", "a"]))).toBe(true));

test('equal sets (different value "order" - instances of the same subclass)', () =>
  expect(deepEqual(mySet(["a", "b"]), mySet(["b", "a"]))).toBe(true));

test("not equal sets (extra value)", () =>
  expect(deepEqual(set(["a", "b"]), set(["a", "b", "c"]))).toBe(false));

test("not equal sets (different values)", () =>
  expect(deepEqual(set(["a", "b", "c"]), set(["a", "b", "d"]))).toBe(false));

test("not equal sets (different instances of objects)", () =>
  expect(deepEqual(set(["a", {}]), set(["a", {}]))).toBe(false));

test("equal sets (same instances of objects)", () =>
  expect(deepEqual(set(["a", emptyObj]), set(["a", emptyObj]))).toBe(true));

test("empty set and empty object are not equal", () =>
  expect(deepEqual({}, new Set())).toBe(false));

test("empty set and empty array are not equal", () =>
  expect(deepEqual([], new Set())).toBe(false));

test("set with extra undefined value is not equal #1", () =>
  expect(deepEqual(set([]), set([undefined]))).toBe(false));

test("set with extra undefined value is not equal #2", () =>
  expect(deepEqual(set([undefined]), set([]))).toBe(false));

test("set and pseudo set are not equal", () =>
  expect(
    deepEqual(new Set(), {
      constructor: Set,
      size: 0,
      has: () => true,
    })
  ).toBe(false));

test("two empty arrays of the same class are equal", () =>
  expect(deepEqual(new Int32Array([]), new Int32Array([]))).toBe(true));

test("two empty arrays of the different class are not equal", () =>
  expect(deepEqual(new Int32Array([]), new Int16Array([]))).toBe(false));

test("equal arrays", () =>
  expect(deepEqual(new Int32Array([1, 2, 3]), new Int32Array([1, 2, 3]))).toBe(
    true
  ));

test("equal BigUint64Array arrays", () =>
  expect(
    deepEqual(
      BigUint64Array.from([BigInt(1), BigInt(2), BigInt(3)]),
      BigUint64Array.from([BigInt(1), BigInt(2), BigInt(3)])
    )
  ).toBe(true));

test("not equal BigUint64Array arrays", () =>
  expect(
    deepEqual(
      BigUint64Array.from([BigInt(1), BigInt(2), BigInt(3)]),
      BigUint64Array.from([BigInt(1), BigInt(2), BigInt(4)])
    )
  ).toBe(false));

test("not equal arrays (same items, different class)", () =>
  expect(deepEqual(new Int32Array([1, 2, 3]), new Int16Array([1, 2, 3]))).toBe(
    false
  ));

test("not equal arrays (different item)", () =>
  expect(deepEqual(new Int32Array([1, 2, 3]), new Int32Array([1, 2, 4]))).toBe(
    false
  ));

test("not equal arrays (different length)", () =>
  expect(deepEqual(new Int32Array([1, 2, 3]), new Int32Array([1, 2]))).toBe(
    false
  ));

test("pseudo array and equivalent typed array are equal", () =>
  expect(
    deepEqual(
      { "0": 1, "1": 2, length: 2, constructor: Int32Array },
      new Int32Array([1, 2])
    )
  ).toBe(true));

function func1(): void {}

function func2(): void {}

class MyMap extends Map {}

class MySet extends Set {}

function map(obj: any, Class?: typeof MyMap): Map<any, any> {
  const a = new (Class || Map)();
  for (const key in obj) {
    a.set(key, obj[key]);
  }

  return a;
}

function myMap(obj: any): MyMap {
  return map(obj, MyMap);
}

function set(arr: any, Class?: typeof MySet): Set<any> {
  const a = new (Class || Set)();
  for (const value of arr) {
    a.add(value);
  }

  return a;
}

function mySet(arr: any): Set<any> {
  return set(arr, MySet);
}

const emptyObj = {};
