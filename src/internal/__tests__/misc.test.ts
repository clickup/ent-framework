import { addSentenceSuffixes, appendCause, minifyStack } from "../misc";

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

const CAUSE_STACK = `error: there is no unique or exclusion constraint matching the ON CONFLICT specification
        at Parser.parseErrorMessage (/Users/user/source/sd/node_modules/pg-protocol/src/parser.ts:369:69)
        at Parser.handlePacket (/Users/user/source/sd/node_modules/pg-protocol/src/parser.ts:188:21)
        at Parser.parse (/Users/user/source/sd/node_modules/pg-protocol/src/parser.ts:103:30)
        at Socket.<anonymous> (/Users/user/source/sd/node_modules/pg-protocol/src/index.ts:7:48)
        at Socket.emit (node:events:519:28)
        at addChunk (node:internal/streams/readable:559:12)
        at readableAddChunkPushByteMode (node:internal/streams/readable:510:3)
        at Socket.Readable.push (node:internal/streams/readable:390:5)
        at TCP.onStreamRead (node:internal/stream_base_commons:191:23)`;
const ERR_STACK = `PgError: there is no unique or exclusion constraint matching the ON CONFLICT specification (pg_error)
        at TestPgClient.query (/Users/user/source/sd/packages/ent-framework/src/pg/PgClient.ts:662:15)
        at processTicksAndRejections (node:internal/process/task_queues:95:5)
        at PgRunnerUpsert.clientQuery (/Users/user/source/sd/packages/ent-framework/src/pg/PgRunner.ts:72:18)
        at PgRunnerUpsert.runBatch (/Users/user/source/sd/packages/ent-framework/src/pg/PgQueryUpsert.ts:113:18)
        at Batcher.flushQueue (/Users/user/source/sd/packages/ent-framework/src/abstract/Batcher.ts:54:19)
        at /Users/user/source/sd/packages/ent-framework/src/abstract/Batcher.ts:151:15
        at processTicksAndRejections (node:internal/process/task_queues:95:5)
        at /Users/user/source/sd/packages/ent-framework/src/abstract/Shard.ts:78:21
        at Cluster.runOnShard (/Users/user/source/sd/packages/ent-framework/src/abstract/Cluster.ts:461:16)
        at Function.upsert (/Users/user/source/sd/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:397:18)
        at async Promise.all (index 0)
        at join (/Users/user/source/sd/packages/ent-framework/src/internal/misc.ts:142:24)
        at Object.<anonymous> (/Users/user/source/sd/packages/ent-framework/src/ent/__tests__/Ent.errors.test.ts:48:5)`;

test("appendCause - merge stacks", () => {
  const err = new Error("test");
  err.stack = ERR_STACK;
  const cause = new Error("cause");
  cause.stack = CAUSE_STACK;
  appendCause(err, cause);
  expect(err.stack).toMatchSnapshot();
});

test("appendCause - don't append twice stacks", () => {
  const err = new Error("test");
  const ERR_STACK_2 = `${ERR_STACK}\nCause: ${CAUSE_STACK}`;
  err.stack = ERR_STACK_2;
  const cause = new Error("cause");
  cause.stack = CAUSE_STACK;
  appendCause(err, cause);
  expect(err.stack).toMatch(ERR_STACK_2);
});

test("appendCause - keep original", () => {
  const err = new Error("test");
  for (const cause of [
    { something: "12345" },
    { stack: undefined },
    null,
    undefined,
  ]) {
    appendCause(err, cause);
    expect(err.stack).toMatch(err.stack!);
  }
});
