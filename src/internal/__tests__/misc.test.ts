import { addSentenceSuffixes, minifyStack } from "../misc";

test("minifyStack", () => {
  expect(
    minifyStack(
      `Error:
        at VC.toAnnotation (/Users/user/sd/packages/slapdash-server/src/lib/ent/ent/VC.ts:353:24)
        at Function.loadNullable (/Users/user/sd/packages/slapdash-server/src/lib/ent/ent/Ent.ts:525:45)
        at Function.loadX (/Users/user/sd/packages/slapdash-server/src/lib/ent/ent/Ent.ts:563:30)
        at EntSome.asset2 (/Users/user/sd/packages/slapdash-server/src/ents/EntSome.ts:45:21)
        at EntSome.<anonymous> (/Users/user/sd/packages/slapdash-shared/src/Memoize.ts:75:40)
        at /Users/user/sd/packages/slapdash-server/src/drivers/asana/AsanaDriver.ts:256:32
        at /Users/user/sd/packages/slapdash-shared/src/promise.ts:55:39
        at Array.map (<anonymous>)
        at Object.mapJoin (/Users/user/sd/packages/slapdash-shared/src/promise.ts:55:23)
        at loadProjects (/Users/user/sd/packages/slapdash-server/src/drivers/asana/AsanaDriver.ts:255:11)`,
      1,
    ),
  ).toMatchSnapshot();
});

test("addSentenceSuffixes", () => {
  expect(addSentenceSuffixes("a", " b", "c")).toEqual("a bc");
  expect(addSentenceSuffixes("a.", " [b]", "c")).toEqual("a [b]c");
  expect(addSentenceSuffixes("a?", "\nb", "c")).toEqual("a?\nbc");
  expect(addSentenceSuffixes("a?", "b", "c")).toEqual("abc");
});
