import { Registry } from "../Registry";

test("creates and deletes objects", async () => {
  const registry = new Registry<number, { id: number | null }>({
    key: (number) => number.toString(),
    create: (number) => ({ id: number }),
    end: async (obj) => (obj.id = null),
  });

  const [obj1, key1] = registry.getOrCreate(1);
  const [obj1same, key1same] = registry.getOrCreate(1);
  expect(obj1).toBe(obj1same);
  expect(key1).toBe(key1same);

  const [obj2, key2] = registry.getOrCreate(2);
  expect(obj1).not.toBe(obj2);

  await registry.deleteExcept(new Set([key2]));
  expect(obj1.id).toBeNull();
  const [obj2same] = registry.getOrCreate(2);
  expect(obj2).toBe(obj2same);

  const [obj1new] = registry.getOrCreate(1);
  expect(obj1new).not.toBe(obj1);
});
