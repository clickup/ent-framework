import { collect } from "streaming-iterables";
import { join } from "../../helpers/misc";
import {
  recreateTestTables,
  testCluster,
} from "../../sql/__tests__/test-utils";
import { SQLSchema } from "../../sql/SQLSchema";
import { ID } from "../../types";
import { BaseEnt, GLOBAL_SHARD } from "../BaseEnt";
import { CanReadOutgoingEdge } from "../predicates/CanReadOutgoingEdge";
import { CanUpdateOutgoingEdge } from "../predicates/CanUpdateOutgoingEdge";
import { IncomingEdgeFromVCExists } from "../predicates/IncomingEdgeFromVCExists";
import { OutgoingEdgePointsToVC } from "../predicates/OutgoingEdgePointsToVC";
import { True } from "../predicates/True";
import { AllowIf } from "../rules/AllowIf";
import { Require } from "../rules/Require";
import type { VC } from "../VC";
import { createVC, expectToMatchSnapshot } from "./test-utils";

/**
 * Company
 */
export class EntTestCompany extends BaseEnt(
  testCluster,
  new SQLSchema(
    'ent.generic"company',
    {
      id: { type: String, autoInsert: "id_gen()" },
      name: { type: String },
    },
    ["name"]
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      name text NOT NULL
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyLoad: [
        new AllowIf(async function VCIsAllSeeing(vc, _company) {
          const vcUser = await EntTestUser.loadX(vc, vc.principal);
          return vcUser.is_alseeing;
        }),
        new AllowIf(
          new IncomingEdgeFromVCExists(EntTestUser, "id", "company_id")
        ),
      ],
      privacyInsert: [],
    });
  }
}

/**
 * User -> Company
 */
export class EntTestUser extends BaseEnt(
  testCluster,
  new SQLSchema(
    'ent.generic"user',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      company_id: { type: ID, allowNull: true, autoInsert: "NULL" },
      name: { type: String },
      url_name: { type: String, allowNull: true },
      is_alseeing: { type: Boolean, autoInsert: "false" },
      created_at: { type: Date, autoInsert: "now()" },
      updated_at: { type: Date, autoUpdate: "now()" },
    },
    ["name"]
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      company_id bigint DEFAULT NULL,
      name text NOT NULL,
      url_name text,
      is_alseeing boolean,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL,
      UNIQUE (name)
    )`,
  ];

  some!: number;

  static override configure() {
    return new this.Configuration({
      shardAffinity: GLOBAL_SHARD,
      privacyInferPrincipal: async (_vc, { id }) => id,
      privacyLoad: [
        new AllowIf(new OutgoingEdgePointsToVC("id")),
        new AllowIf(new CanReadOutgoingEdge("company_id", EntTestCompany)),
      ],
      privacyInsert: [],
      privacyUpdate: [new Require(new OutgoingEdgePointsToVC("id"))],
    });
  }

  nameUpper(): string {
    return this.name.toUpperCase();
  }
}

/**
 * Post -> User -> Company
 */
export class EntTestPost extends BaseEnt(
  testCluster,
  new SQLSchema(
    'ent.generic"post',
    {
      post_id: { type: ID, autoInsert: "id_gen()" },
      user_id: { type: ID },
      title: { type: String },
      created_at: { type: Date, autoInsert: "now()" },
    },
    ["post_id"]
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      post_id bigint NOT NULL PRIMARY KEY,
      user_id bigint NOT NULL,
      title text NOT NULL,
      created_at timestamptz NOT NULL
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: ["post_id"],
      privacyLoad: [
        new AllowIf(new CanReadOutgoingEdge("user_id", EntTestUser)),
      ],
      privacyInsert: [
        new Require(new CanUpdateOutgoingEdge("user_id", EntTestUser)),
      ],
      privacyUpdate: [
        new Require(async function VCInSameCompany(vc, post) {
          // A post can be updated by anyone in the same company.
          const postUser = await EntTestUser.loadX(vc, post.user_id);
          const vcUser = await EntTestUser.loadX(vc, vc.principal);
          return postUser.company_id === vcUser.company_id;
        }),
      ],
    });
  }

  titleUpper(): string {
    return this.title.toUpperCase();
  }

  async user(): Promise<EntTestUser> {
    return EntTestUser.loadX(this.vc, this.user_id);
  }
}

/**
 * Comment -> Post -> User -> Company
 */
export class EntTestComment extends BaseEnt(
  testCluster,
  new SQLSchema(
    'ent.generic"comment',
    {
      comment_id: { type: String, autoInsert: "id_gen()" },
      post_id: { type: ID },
      text: { type: String },
    },
    ["comment_id"]
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      comment_id bigint NOT NULL PRIMARY KEY,
      post_id bigint NOT NULL,
      text text NOT NULL
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: ["post_id"],
      privacyLoad: [
        new AllowIf(new CanReadOutgoingEdge("post_id", EntTestPost)),
      ],
      privacyInsert: [
        new Require(new CanUpdateOutgoingEdge("post_id", EntTestPost)),
      ],
    });
  }

  textUpper(): string {
    return this.text.toUpperCase();
  }
}

/**
 * Like -> Post -> User -> Company
 */
export class EntTestLike extends BaseEnt(
  testCluster,
  new SQLSchema(
    'ent.generic"like',
    {
      id: { type: ID, autoInsert: "id_gen()" },
      post_id: { type: ID },
      user_id: { type: ID },
    },
    ["post_id", "user_id"]
  )
) {
  static readonly CREATE = [
    `CREATE TABLE %T(
      id bigint NOT NULL PRIMARY KEY,
      post_id bigint NOT NULL,
      user_id bigint NOT NULL
    )`,
  ];

  static override configure() {
    return new this.Configuration({
      shardAffinity: ["post_id"],
      privacyLoad: [
        new AllowIf(new CanReadOutgoingEdge("post_id", EntTestPost)),
      ],
      privacyInsert: [
        new Require(new CanUpdateOutgoingEdge("post_id", EntTestPost)),
      ],
    });
  }
}

let vc: VC;
let vcOther: VC;

beforeEach(async () => {
  await recreateTestTables([
    EntTestCompany,
    EntTestUser,
    EntTestPost,
    EntTestComment,
    EntTestLike,
  ]);

  const company = await EntTestCompany.insertReturning(
    createVC().toOmniDangerous(),
    { name: "some" }
  );

  const user = await EntTestUser.insertReturning(company.vc.toOmniDangerous(), {
    company_id: company.id,
    name: "John",
    url_name: "john",
  });
  expect(user.vc.principal).toEqual(user.id);
  vc = user.vc;

  const otherUser = await EntTestUser.insertReturning(
    company.vc.toOmniDangerous(),
    { name: Date.now().toString(), url_name: "" }
  );
  vcOther = otherUser.vc;
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
  user1.some = 10;
  expect(user2.some).toEqual(10);
});

test("loadX coalescing produces different objects for different vc", async () => {
  const [user1, user2] = await join([
    EntTestUser.loadX(vc, vc.principal),
    EntTestUser.loadX(vc.toOmniDangerous(), vc.principal),
  ]);
  user1.some = 10;
  expect(user2.some).toBeUndefined();
});

test("loadNullable with no access", async () => {
  try {
    await EntTestUser.loadNullable(vcOther, vc.principal);
    fail("must throw an exception");
  } catch (e: unknown) {
    expectToMatchSnapshot("" + e);
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
  } catch (e: unknown) {
    expectToMatchSnapshot("" + e);
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
  } catch (e: unknown) {
    expectToMatchSnapshot("" + e);
  }
});

test("selectBy", async () => {
  const post = await EntTestPost.insertReturning(vc, {
    user_id: vc.principal,
    title: "some_post",
  });
  const like = await EntTestLike.insertReturning(vc, {
    post_id: post.id,
    user_id: vc.principal,
  });
  const likes = await EntTestLike.selectBy(vc, {
    post_id: post.id,
  });
  expect(likes.map((ent) => ent.id)).toEqual([like.id]);
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

  const exists1 = await EntTestComment.exists(vc, {
    post_id: post.id,
    text: ["c1", "c2", "c3"],
  });
  expect(exists1).toStrictEqual(true);

  const exists2 = await EntTestComment.exists(vc, {
    post_id: post.id,
    text: ["cNonExistent"],
  });
  expect(exists2).toStrictEqual(false);
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

test("updateChanged ignores $literal when all fields are unchanged", async () => {
  let user = await EntTestUser.loadX(vc, vc.principal);
  expect(
    await user.updateChanged({
      url_name: "john",
      $literal: ["url_name=?", "new"],
    })
  ).toStrictEqual(null);
  user = await EntTestUser.loadX(vc, vc.principal);
  expect(user).toMatchObject({ name: "John", url_name: "john" });

  expect(
    await user.updateChanged({
      $literal: ["url_name=?", "new"],
    })
  ).toStrictEqual(null);
  user = await EntTestUser.loadX(vc, vc.principal);
  expect(user).toMatchObject({ name: "John", url_name: "john" });
});

test("updateChanged applies $literal when there are changed fields", async () => {
  let user = await EntTestUser.loadX(vc, vc.principal);
  expect(
    await user.updateChanged({
      name: "Doe",
      $literal: ["url_name=?", "new"],
    })
  ).toStrictEqual(["name"]);
  user = await EntTestUser.loadX(vc, vc.principal);
  expect(user).toMatchObject({ name: "Doe", url_name: "new" });
});

test("updateChangedReturningX", async () => {
  const user = await EntTestUser.loadX(vc, vc.principal);
  const newUser1 = await user.updateChangedReturningX({ url_name: "new" });
  expect(newUser1).toMatchObject({ name: "John", url_name: "new" });
  expect(newUser1 === user).toBeFalsy();
  const newUser2 = await newUser1.updateChangedReturningX({ url_name: "new" });
  expect(newUser2 === newUser1).toBeTruthy();
});

test("updateOriginal with CAS", async () => {
  // There are way more tests for CAS in sql/__tests__, with all corner cases
  // covered; here we just illustrate the basic syntax.
  const user = await EntTestUser.loadX(vc, vc.principal);

  expect(
    await user.updateOriginal({
      url_name: "skip",
      $cas: { updated_at: new Date(42) },
    })
  ).toBeFalsy();

  expect(
    await user.updateOriginal({
      url_name: "new",
      $cas: { updated_at: user.updated_at },
    })
  ).toBeTruthy();

  expect(
    await user.updateOriginal({
      url_name: "skip2",
      $cas: ["updated_at"],
    })
  ).toBeFalsy();

  let newUser = await EntTestUser.loadX(vc, vc.principal);
  expect(newUser).toMatchObject({ url_name: "new" });
  expect(
    await newUser.updateOriginal({
      url_name: "newest",
      $cas: "skip-if-someone-else-changed-updating-ent-props",
    })
  ).toBeTruthy();

  newUser = await EntTestUser.loadX(vc, vc.principal);
  expect(
    await newUser.updateOriginal({
      url_name: "newest",
      $cas: ["updated_at"],
    })
  ).toBeTruthy();
});

test("updateChanged with CAS", async () => {
  const user = await EntTestUser.loadX(vc, vc.principal);
  expect(
    await user.updateChanged({
      url_name: "skip-by-cas",
      $cas: { updated_at: new Date(42) },
    })
  ).toStrictEqual(false);
  expect(
    await user.updateChanged({
      url_name: user.url_name, // skipped since no fields are changed
      $cas: { updated_at: new Date(42) }, // CAS doesn't matter
    })
  ).toStrictEqual(null);
  expect(
    await user.updateChanged({
      url_name: user.url_name, // skipped since no fields are changed
      $cas: ["updated_at"], // CAS doesn't matter
    })
  ).toStrictEqual(null);
  expect(
    await user.updateChanged({
      url_name: "new", // field changed
      $cas: ["updated_at"], // CAS succeeded
    })
  ).toStrictEqual(["url_name"]);
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
  } catch (e: unknown) {
    expectToMatchSnapshot("" + e);
  }
});

test("heisenbug: two different schema field sets make schema hash different", async () => {
  const schema1 = new SQLSchema(
    EntTestUser.SCHEMA.name,
    {
      id: { type: ID, autoInsert: "id_gen()" },
      company_id: { type: ID, allowNull: true, autoInsert: "NULL" },
    },
    []
  );

  const schema2 = new SQLSchema(
    EntTestUser.SCHEMA.name,
    {
      id: { type: ID, autoInsert: "id_gen()" },
      name: { type: String },
    },
    []
  );

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
    company_id!: string;

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
  expect(row2.company_id).toBeUndefined(); // heisenbug was here
});

test("attempt to use guest VC to load Ents", async () => {
  const fakeNull = null as unknown as string;
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
    EntTestPost.select(vc.toGuest(), { post_id: fakeNull }, 1)
  ).rejects.toThrowErrorMatchingSnapshot();
  await expect(
    EntTestPost.loadNullable(vc.toGuest(), fakeNull)
  ).rejects.toThrowErrorMatchingSnapshot();
});

test("write without affecting timeline", async () => {
  const preInsertTimeline = vc.serializeTimelines();
  const vcDerived = vc.withOneTimeStaleReplica();
  await EntTestPost.insertReturning(vcDerived, {
    user_id: vc.principal,
    title: "some_post",
  });
  expect(vcDerived.serializeTimelines()).toEqual(preInsertTimeline);
  expect(vc.serializeTimelines()).toEqual(preInsertTimeline);
});

test("should support inserting simple Ents with custom IDs", async () => {
  const ent = await EntTestUser.insertReturning(vc.toOmniDangerous(), {
    name: "Test",
    url_name: null,
  });
  await ent.deleteOriginal();
  const newEnt = await EntTestUser.insertReturning(vc.toOmniDangerous(), ent);
  expect(newEnt.id).toEqual(ent.id);
});
