import { join } from "../helpers";
import memoize2 from "../memoize2";

let sequenceValue = 1;

function localUniqueInt(): number {
  return sequenceValue++;
}

test("memoize2 works", () => {
  const $tag1 = Symbol("$tag1");
  const $tag2 = Symbol("$tag2");
  const obj = { a: 42 };

  const f1A = memoize2(obj, $tag1, (x: number, y: number) => ({
    uniq: localUniqueInt(),
    sum: x + y,
  }));
  const f1B = memoize2(obj, $tag1, (x: number, y: number) => ({
    uniq: localUniqueInt(),
    sum: x + y,
  }));
  const f2 = memoize2(obj, $tag2, (x: number, y: number) => ({
    uniq: localUniqueInt(),
    sum: x + y,
  }));

  expect(f1A === f1B).toBeTruthy();
  expect(f1A !== f2).toBeTruthy();

  expect(f1A(1, 1).sum).toEqual(2);

  expect(f1A(1, 1)).toEqual(f1B(1, 1));
  expect(f1A(1, 1)).not.toEqual(f1B(1, 2));
  expect(f1A(1, 1)).not.toEqual(f1B(2, 1));
});

test("memoize2 has only 1 cache slot", () => {
  const $tag = Symbol("$tag1");
  const obj = { a: 42 };
  const f = memoize2(obj, $tag, (x: number, y: number) => ({
    uniq: localUniqueInt(),
    sum: x + y,
  }));

  const before = f(10, 20);
  f(30, 40); // this erases the previous cache for (10, 20)
  const after = f(10, 20);
  expect(before).not.toEqual(after);
});

test("memoize2 works for Promise", async () => {
  const $tag = Symbol("$tag1");
  const obj = { a: 42 };
  const funcs = [0, 1].map(() =>
    memoize2(
      obj,
      $tag,
      async (x: number, y: number) =>
        new Promise((resolve) =>
          setImmediate(() => resolve({ uniq: localUniqueInt(), sum: x + y }))
        )
    )
  );

  const res1 = await join([funcs[0](1, 1), funcs[1](1, 1)]);
  expect(res1[0]).toEqual(res1[1]);

  const res2 = await join([funcs[0](3, 3), funcs[1](4, 4)]);
  expect(res2[0]).not.toEqual(res2[1]);

  expect(await funcs[0](10, 10)).toEqual(await funcs[0](10, 10));
  expect(await funcs[0](10, 10)).not.toEqual(await funcs[0](20, 20));
  expect(await funcs[0](30, 30)).not.toEqual(await funcs[0](40, 40));
});
