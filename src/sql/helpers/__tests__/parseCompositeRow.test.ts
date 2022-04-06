import parseCompositeRow from "../parseCompositeRow";

test("parseCompositeRow", async () => {
  expect(parseCompositeRow("()")).toEqual([null]);
  expect(parseCompositeRow("(,)")).toEqual([null, null]);
  expect(parseCompositeRow('("1","2")')).toEqual(["1", "2"]);
  expect(parseCompositeRow('(,"aaa")')).toEqual([null, "aaa"]);
  expect(parseCompositeRow('("1","2","(""d""""d"",""5"")")')).toEqual([
    "1",
    "2",
    '("d""""d"",""5"")',
  ]);
  expect(parseCompositeRow('("1","2","{""x"",""y""}")')).toEqual([
    "1",
    "2",
    '{"x"",""y""}',
  ]);
  expect(parseCompositeRow('("aaa",)')).toEqual(["aaa", null]);
  expect(parseCompositeRow('("a\\\\b")')).toEqual(["a\\b"]);
  expect(parseCompositeRow("(aa)")).toEqual(["aa"]);
  expect(parseCompositeRow('("aaaaa aa","2")')).toEqual(["aaaaa aa", "2"]);
  expect(parseCompositeRow("(12345,678)")).toEqual(["12345", "678"]);

  await expect(async () => parseCompositeRow("(")).rejects.toThrow();
  await expect(async () => parseCompositeRow('("aa)')).rejects.toThrow();
  await expect(async () => parseCompositeRow("(aa")).rejects.toThrow();
});
