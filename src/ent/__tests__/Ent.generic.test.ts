import { inspect } from "util";
import { collect } from "streaming-iterables";
import { join } from "../../helpers";
import { testCluster } from "../../sql/__tests__/helpers/TestSQLClient";
import { SQLSchema } from "../../sql/SQLSchema";
import { ID } from "../../types";
import { BaseEnt, GLOBAL_SHARD } from "../BaseEnt";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import type { VC } from "../VC";
import {
  $EPHEMERAL,
  $EPHEMERAL2,
  EntTestComment,
  EntTestCountry,
  EntTestHeadline,
  EntTestPost,
  EntTestUser,
  expectToMatchSnapshot,
  init,
} from "./helpers/test-objects";

let vc: VC;
let vcOther: VC;

beforeEach(async () => {
  try {
    [vc, vcOther] = await init();
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e);
    throw e;
  }
});

test("simple use case", async () => {
  const user = await EntTestUser.loadX(vc, vc.principal);
  expect(user.url_name).toEqual("john");

  const post = await EntTestPost.insertReturning(vc, {
    user_id: user.id,
    title: "something",
  });
  expect(post.created_at).toBeInstanceOf(Date);

  const loadedUser = await post.user();
  expect(loadedUser.name).toEqual(user.name);
});

test("loadX", async () => {
  const user = await EntTestUser.loadX(vc, vc.principal);
  expect(user.nameUpper()).toEqual("JOHN");
});

test("loadX coalescing produces same objects", async () => {
  const [user1, user2] = await join([
    EntTestUser.loadX(vc, vc.principal),
    EntTestUser.loadX(vc, vc.principal),
  ]);
  (user1 as any).some = 10;
  expect((user2 as any).some).toEqual(10);
});

test("loadX coalescing produces different objects for different vc", async () => {
  const [user1, user2] = await join([
    EntTestUser.loadX(vc, vc.principal),
    EntTestUser.loadX(vc.toOmniDangerous(), vc.principal),
  ]);
  (user1 as any).some = 10;
  expect((user2 as any).some).toBeUndefined();
});

test("loadNullable with no access", async () => {
  try {
    await EntTestUser.loadNullable(vcOther, vc.principal);
    fail("must throw an exception");
  } catch (e: any) {
    expectToMatchSnapshot(e.message);
  }
});

test("load child with no access", async () => {
  const post = await EntTestPost.insertReturning(vc, {
    user_id: vc.principal,
    title: "some_post",
  });
  const comment = await EntTestComment.insertReturning(vc, {
    post_id: post.id,
    text: "some_comment",
  });
  try {
    await EntTestComment.loadNullable(vcOther, comment.id);
    fail("must throw an exception");
  } catch (e: any) {
    expectToMatchSnapshot(e.message);
  }
});

test("loadByX", async () => {
  const user = await EntTestUser.loadByX(vc, { name: "John" });
  expect(user.url_name).toEqual("john");
  expect(user.nameUpper()).toEqual("JOHN");

  expect(await EntTestUser.loadByNullable(vc, { name: "zzz" })).toBeNull();
});

test("loadBy with no access", async () => {
  try {
    await EntTestUser.loadByX(vcOther, { name: "John" });
    fail("must throw an exception");
  } catch (e: any) {
    expectToMatchSnapshot(e.message);
  }
});

test("select and count", async () => {
  const post = await EntTestPost.insertReturning(vc, {
    user_id: vc.principal,
    title: "post",
  });
  await join([
    EntTestComment.insertReturning(vc, { post_id: post.id, text: "c2" }),
    EntTestComment.insertReturning(vc, { post_id: post.id, text: "c3" }),
  ]);

  const comments = await EntTestComment.select(
    vc,
    { post_id: post.id, text: ["c1", "c2", "c3"] },
    2,
    [{ text: "DESC" }]
  );
  expect(comments.length).toEqual(2);
  expect(comments[0].textUpper()).toEqual("C3");
  expect(comments[1].textUpper()).toEqual("C2");

  const comments2 = await EntTestComment.select(
    vc,
    { id: [comments[0].id, comments[1].id] },
    2,
    [{ text: "DESC" }]
  );
  expect(comments2.length).toEqual(2);

  const error1 = await EntTestComment.select(
    vc,
    { post_id: [] },
    Number.MAX_SAFE_INTEGER
  ).catch((e) => e.toString());
  expect(error1).toMatchSnapshot();

  const error2 = await EntTestComment.select(
    vc,
    { post_id: "" },
    Number.MAX_SAFE_INTEGER
  ).catch((e) => e.toString());
  expect(error2).toMatchSnapshot();

  const count = await EntTestComment.count(vc, {
    post_id: post.id,
    text: ["c1", "c2", "c3"],
  });
  expect(count).toEqual(2);
});

test("selectChunked", async () => {
  const post = await EntTestPost.insertReturning(vc, {
    user_id: vc.principal,
    title: "post",
  });
  await join([
    EntTestComment.insertReturning(vc, { post_id: post.id, text: "c2" }),
    EntTestComment.insertReturning(vc, { post_id: post.id, text: "c3" }),
    EntTestComment.insertReturning(vc, { post_id: post.id, text: "c4" }),
    EntTestComment.insertReturning(vc, { post_id: post.id, text: "c5" }),
  ]);

  const commentChunks = await collect(
    EntTestComment.selectChunked(
      vc,
      { post_id: post.id, $not: { text: "c4" } },
      2,
      Number.MAX_SAFE_INTEGER
    )
  );
  expect(commentChunks.length).toEqual(2);
  expect(commentChunks[0].length).toEqual(2);
  expect(commentChunks[1].length).toEqual(1);

  const noChunks = await collect(
    EntTestComment.selectChunked(
      vc,
      { post_id: post.id, text: "nothing" },
      2,
      Number.MAX_SAFE_INTEGER
    )
  );
  expect(noChunks).toEqual([]);
});

test("custom shard", async () => {
  const post = await EntTestPost.insertReturning(vc, {
    user_id: vc.principal,
    title: "something",
  });
  const idInOtherNonGlobalShard = post.id.replace(
    /^(\d0+)(\d)/s,
    (_, m1, m2) => m1 + (((parseInt(m2) - 1 + 1) % 2) + 1).toString()
  );

  const posts = await EntTestPost.select(
    vc,
    { id: post.id, $shardOfID: idInOtherNonGlobalShard },
    Number.MAX_SAFE_INTEGER
  );
  expect(posts).toHaveLength(0);

  const error = await EntTestPost.select(
    vc,
    { id: post.id, $shardOfID: "" },
    Number.MAX_SAFE_INTEGER
  ).catch((e) => e.toString());
  expect(error).toMatchSnapshot();
});

test("upsertReturning overwrites", async () => {
  const user = await EntTestUser.upsertReturning(vc.toOmniDangerous(), {
    name: "John",
    url_name: "new_value",
  });
  expect(user).toMatchObject({ name: "John", url_name: "new_value" });
});

test("upsertReturning creates new ent", async () => {
  const newUser = await EntTestUser.upsertReturning(vc.toOmniDangerous(), {
    name: "Someone",
    url_name: "someone",
  });
  expect(newUser).toMatchObject({ name: "Someone", url_name: "someone" });
  expect(newUser.vc.principal).toEqual(newUser.id);
});

test("updateReturningX", async () => {
  const user = await EntTestUser.loadX(vc, vc.principal);
  const newUser = await user.updateReturningX({ url_name: "new" });
  expect(newUser).toMatchObject({ name: "John", url_name: "new" });
  expect(newUser.nameUpper()).toEqual("JOHN");
});

test("updateChangedReturningX", async () => {
  const user = await EntTestUser.loadX(vc, vc.principal);
  const newUser1 = await user.updateChangedReturningX({ url_name: "new" });
  expect(newUser1).toMatchObject({ name: "John", url_name: "new" });
  expect(newUser1 === user).toBeFalsy();
  const newUser2 = await newUser1.updateChangedReturningX({ url_name: "new" });
  expect(newUser2 === newUser1).toBeTruthy();
});

test("delete", async () => {
  const user = await EntTestUser.loadX(vc, vc.principal);
  expect(await user.deleteOriginal()).toBeTruthy();
  expect(await EntTestUser.loadNullable(vc, vc.principal)).toBeNull();
  expect(await user.deleteOriginal()).toBeFalsy();
});

test("can read post of the same company user", async () => {
  const user = await EntTestUser.loadX(vc, vc.principal);
  const post = await EntTestPost.insertReturning(vc, {
    user_id: user.id,
    title: "something",
  });

  const user2 = await EntTestUser.insertReturning(vc.toOmniDangerous(), {
    company_id: user.company_id,
    name: "Jane",
    url_name: "jane",
  });
  const post2 = await EntTestPost.loadX(user2.vc, post.id);
  expect(post2.title).toEqual("something");
});

test("can update comment of the same company user", async () => {
  const user = await EntTestUser.loadX(vc, vc.principal);
  const post = await EntTestPost.insertReturning(vc, {
    user_id: user.id,
    title: "something",
  });
  const comment = await EntTestComment.insertReturning(vc, {
    post_id: post.id,
    text: "some",
  });

  // Add user to the company.
  const user2 = await EntTestUser.insertReturning(vc.toOmniDangerous(), {
    company_id: user.company_id,
    name: "Jane",
    url_name: "jane",
  });

  // Check that this user can update comments of other same-company users.
  const commentViaUser2 = await EntTestComment.loadX(user2.vc, comment.id);
  await commentViaUser2.updateOriginal({ text: "other" });
  await commentViaUser2.deleteOriginal();
});

test("cannot create posts for different users", async () => {
  const userAllseeing = await EntTestUser.insertReturning(
    vc.toOmniDangerous(),
    { is_alseeing: true, name: "All-seeing", url_name: "all-seeing" }
  );
  try {
    await EntTestPost.insertReturning(userAllseeing.vc, {
      user_id: vc.principal,
      title: "something",
    });
    fail("must throw an exception");
  } catch (e: any) {
    expectToMatchSnapshot(e.message);
  }
});

test("heisenbug: two different schema field sets make schema hash different", async () => {
  const schema1 = new SQLSchema(EntTestUser.SCHEMA.name, {
    id: { type: ID, autoInsert: "id_gen()" },
    company_id: { type: ID, allowNull: true, autoInsert: "NULL" },
  });

  const schema2 = new SQLSchema(EntTestUser.SCHEMA.name, {
    id: { type: ID, autoInsert: "id_gen()" },
    name: { type: String },
  });

  class Ent1 extends BaseEnt(testCluster, schema1) {
    static override configure() {
      return new this.Configuration({
        shardAffinity: GLOBAL_SHARD,
        privacyLoad: [new AllowIf(new True())],
        privacyInsert: [],
        privacyUpdate: [new Require(new True())],
      });
    }
  }

  class Ent2 extends BaseEnt(testCluster, schema2) {
    static override configure() {
      return new this.Configuration({
        shardAffinity: GLOBAL_SHARD,
        privacyLoad: [new AllowIf(new True())],
        privacyInsert: [],
        privacyUpdate: [new Require(new True())],
      });
    }
  }

  const row1 = await Ent1.loadX(vc, vc.principal);
  const row2 = await Ent2.loadX(vc, vc.principal);
  expect(row1.company_id).toBeTruthy();
  expect((row2 as any).company_id).toBeUndefined(); // heisenbug was here
});

test("triggers", async () => {
  EntTestHeadline.TRIGGER_CALLS = [];
  await EntTestHeadline.insertReturning(vc, {
    user_id: vc.principal,
    headline: "xyz",
    [$EPHEMERAL]: null,
  });
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "0: insert happened"
  );

  EntTestHeadline.TRIGGER_CALLS = [];
  const headline = await EntTestHeadline.insertReturning(vc, {
    user_id: vc.principal,
    headline: "abc",
    [$EPHEMERAL]: "eph",
    [$EPHEMERAL2]: 42,
  });
  expect(headline.headline).toEqual(
    "abc added-by-beforeInsert1 added-by-beforeInsert2"
  );
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "1: insert happened"
  );

  EntTestHeadline.TRIGGER_CALLS = [];
  const headline2 = await headline.updateReturningX({
    headline: "xyz-updated",
    name: "new-name",
    [$EPHEMERAL2]: 101,
  });
  expect(headline2.headline).toEqual("xyz-updated added-by-beforeUpdate");
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "2: update happened"
  );

  EntTestHeadline.TRIGGER_CALLS = [];
  const headline3 = await headline.updateReturningX({
    [$EPHEMERAL]: "eph3",
  });
  expect(headline3.headline).toEqual(
    "abc added-by-beforeInsert1 added-by-beforeInsert2 added-by-beforeUpdate"
  );
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "3: noop-update happened"
  );

  EntTestHeadline.TRIGGER_CALLS = [];
  await headline.updateChanged({
    [$EPHEMERAL]: "eph4",
  });
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "4: updateChanged happened"
  );

  EntTestHeadline.TRIGGER_CALLS = [];
  await headline.deleteOriginal();
  expect(await EntTestHeadline.loadNullable(vc, headline.id)).toBeNull();
  expectToMatchSnapshot(
    inspect(EntTestHeadline.TRIGGER_CALLS),
    "5: delete happened"
  );
});

test("skip after triggers if operation soft fails", async () => {
  await EntTestCountry.insertReturning(vc, { name: "zzz" });

  EntTestCountry.TRIGGER_CALLS = [];
  const abc = await EntTestCountry.insertReturning(vc, { name: "abc" });
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "1: insert happened"
  );

  EntTestCountry.TRIGGER_CALLS = [];
  await EntTestCountry.insertIfNotExists(vc, { name: "abc" });
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "2: insert soft-failed on unique key conflict"
  );

  await abc.deleteOriginal();

  EntTestCountry.TRIGGER_CALLS = [];
  await abc.updateOriginal({ name: "zzz" });
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "3: update soft-failed on non-existing row"
  );

  EntTestCountry.TRIGGER_CALLS = [];
  await abc.deleteOriginal();
  expectToMatchSnapshot(
    inspect(EntTestCountry.TRIGGER_CALLS),
    "4: delete soft-failed on non-existing row"
  );
});

test("attempt to use guest VC to load Ents", async () => {
  await expect(
    EntTestPost.loadNullable(vc.toGuest(), vc.toGuest().principal)
  ).rejects.toThrowErrorMatchingSnapshot();
  await expect(
    EntTestPost.loadX(vc.toGuest(), vc.toGuest().principal)
  ).rejects.toThrowErrorMatchingSnapshot();
  await expect(
    EntTestPost.select(vc.toGuest(), { post_id: vc.toGuest().principal }, 1)
  ).rejects.toThrowErrorMatchingSnapshot();
  await expect(
    EntTestPost.select(vc.toGuest(), { post_id: null as any }, 1)
  ).rejects.toThrowErrorMatchingSnapshot();
  await expect(
    EntTestPost.loadNullable(vc.toGuest(), null as any)
  ).rejects.toThrowErrorMatchingSnapshot();
});
