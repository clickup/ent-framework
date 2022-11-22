import { minifyStack } from "../misc";

test("minifyStack", () => {
  expect(
    minifyStack(
      `Error:
        at VC.toAnnotation (/Users/user/slapdash/packages/slapdash-server/src/lib/ent/ent/VC.ts:353:24)
        at Function.loadNullable (/Users/user/slapdash/packages/slapdash-server/src/lib/ent/ent/Ent.ts:525:45)
        at Function.loadX (/Users/user/slapdash/packages/slapdash-server/src/lib/ent/ent/Ent.ts:563:30)
        at EntSome.asset2 (/Users/user/slapdash/packages/slapdash-server/src/ents/EntSome.ts:45:21)
        at EntSome.<anonymous> (/Users/user/slapdash/packages/slapdash-shared/src/Memoize.ts:75:40)
        at /Users/user/slapdash/packages/slapdash-server/src/drivers/asana/AsanaDriver.ts:256:32
        at /Users/user/slapdash/packages/slapdash-shared/src/promise.ts:55:39
        at Array.map (<anonymous>)
        at Object.mapJoin (/Users/user/slapdash/packages/slapdash-shared/src/promise.ts:55:23)
        at loadProjects (/Users/user/slapdash/packages/slapdash-server/src/drivers/asana/AsanaDriver.ts:255:11)`,
      1
    )
  ).toMatchSnapshot();
});
