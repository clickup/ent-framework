import { objectId } from "../objectId";

test("different", () => {
  expect(objectId({ a: 42 })).not.toEqual(objectId({}));
  expect(objectId({ a: 42 })).not.toEqual(objectId({ a: 42 }));
});

test("same", () => {
  const obj = { a: 42 };
  expect(objectId(obj)).toEqual(objectId(obj));
});
