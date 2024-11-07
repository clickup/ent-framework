import { createHash } from "crypto";
import { inspect } from "util";
import compact from "lodash/compact";
import objectHashModule from "object-hash";

/**
 * In some cases (e.g. when actively working with callbacks), TS is still weak
 * enough, so we are not always able to use generics/unknown/never types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DesperateAny = any;

/**
 * Removes constructor signature from a type.
 * https://github.com/microsoft/TypeScript/issues/40110#issuecomment-747142570
 */
export type OmitNew<T extends new (...args: never[]) => unknown> = Pick<
  T,
  keyof T
>;

/**
 * Adds a type alternative to constructor signature's return value. This is
 * useful when we e.g. turn an instance of some Ent class into an Instance & Row
 * type where Row is dynamically inferred from the schema.
 */
export type AddNew<
  TClass extends new (...args: never[]) => unknown,
  TRet,
> = OmitNew<TClass> & { new (): InstanceType<TClass> & TRet };

/**
 * Flattens the interface to make it more readable in IntelliSense. Can be used
 * when someone modifies (picks, omits, etc.) a huge type.
 */
export type Flatten<T> = {} & { [P in keyof T]: T[P] };

/**
 * Cancels "readonly" specifier on object's properties.
 */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Returns a union type of all tuple strict prefixes:
 * ["a", "b", "c"] -> ["a", "b"] | ["a"]
 */
export type TuplePrefixes<T extends readonly unknown[]> = T extends [unknown]
  ? []
  : T extends [infer First, ...infer Rest]
    ? [First, ...TuplePrefixes<Rest>] | [First]
    : [];

/**
 * Picks only partial (optional) keys of an object.
 */
export type PickPartial<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]: T[K];
};

/**
 * Denotes an option which can be dynamically configured at runtime.
 */
export type MaybeCallable<T> = T | (() => T);

/**
 * Some Node APIs throw not an instance of Error object, but something looking
 * like an Error. So we can't do "instanceof Error" check in all cases, we can
 * only compare the shape of a variable received in a `catch (e: unknown)` block
 * and hope for best.
 */
export type MaybeError<TExtra extends {} = {}> =
  | ({ code?: string; message?: string; stack?: string } & Partial<TExtra>)
  | null
  | undefined;

/**
 * Turns a list of Promises to a list of Promise resolution results.
 */
export async function join<TList extends readonly unknown[]>(
  promises: TList,
): Promise<{ -readonly [P in keyof TList]: Awaited<TList[P]> }>;

/**
 * Turns an object where some values are Promises to an object with values as
 * Promise resolution results.
 */
export async function join<TRec extends Readonly<Record<string, unknown>>>(
  promises: TRec,
): Promise<{ -readonly [K in keyof TRec]: Awaited<TRec[K]> }>;

/**
 * A safe replacement for Promise-all built-in method.
 *
 * Works the same way as Promise-all, but additionally guarantees that ALL OTHER
 * promises have settled in case one of them rejects. This is needed to ensure
 * that we never have unexpected "dangling" promises continuing running in
 * nowhere in case one of the promises rejects early (the behavior of
 * Promise.all is to reject eagerly and let the rest of stuff running whilst the
 * caller code unfreezes).
 *
 * The behavior of join() is similar to Promise.allSettled(), but it throws the
 * 1st exception occurred; this is what's expected in most of the cases, and
 * this is how promises are implemented in e.g. Hack.
 *
 * The benefits of ensuring everything is settled:
 *
 * 1. We never have surprising entries in our logs (e.g. imagine a request
 *    aborted long time ago, and then some "dangling" promises continue running
 *    and issue queries as if nothing happened).
 * 2. Predictable control flow: if we run `await join()`, we know that no side
 *    effects from the spawned promises will appear after this await throws or
 *    returns.
 *
 * "Join" is a term from parallel programming (e.g. "join threads"), it’s pretty
 * concrete and means that after the call, multiple parallel execution flows
 * “join” into one. It's a word to describe having "one" from "many".
 *
 * What’s interesting is that, besides Promise-all leaks execution flows, it
 * still doesn’t trigger unhandledRejection for them in case one of them throws
 * later, it just swallows all other exceptions.
 *
 * I.e. Promise-all means "run all in parallel, if one throws - throw
 * immediately and let the others continue running in nowhere; if some of THAT
 * others throws, swallow their exceptions".
 *
 * And join() means "run all in parallel, if one throws - wait until everyone
 * finishes, and then throw the 1st exception; if some of others throw, swallow
 * their exceptions".
 *
 * See also https://en.wikipedia.org/wiki/Fork%E2%80%93join_model
 */
export async function join(promises: unknown[] | object): Promise<unknown> {
  const promisesArray =
    promises instanceof Array ? promises : Object.values(promises);
  let firstError: unknown = undefined;
  let errorCount = 0;
  const resultsArray = await Promise["all"](
    promisesArray.map(async (promise) =>
      Promise.resolve(promise).catch((err) => {
        if (errorCount === 0) {
          firstError = err;
        }

        errorCount++;
        return undefined;
      }),
    ),
  );
  if (errorCount > 0) {
    throw firstError;
  }

  return promises instanceof Array
    ? resultsArray
    : Object.fromEntries(
        Object.keys(promises).map((key, i) => [key, resultsArray[i]]),
      );
}

/**
 * A shortcut for `await join(arr.map(async ...))`.
 */
export async function mapJoin<TElem, TRet>(
  arr: readonly TElem[] | Promise<readonly TElem[]>,
  func: (e: TElem, idx: number) => PromiseLike<TRet> | TRet,
): Promise<TRet[]> {
  return join((await arr).map((e, idx) => func(e, idx)));
}

/**
 * Returns a random value between 1 and 1+jitter.
 */
export function jitter(jitter: number): number {
  return 1 + jitter * Math.random();
}

/**
 * Copies a stack-trace from fromErr error into toErr object. Useful for
 * lightweight exceptions wrapping.
 */
export function copyStack<
  TError extends Error,
  TFrom extends { stack?: unknown; message?: unknown } | null | undefined,
>(toErr: TError, fromErr: TFrom): TError {
  if (
    typeof fromErr?.stack !== "string" ||
    typeof fromErr?.message !== "string"
  ) {
    return toErr;
  }

  // This is magic, the 1st line in stacktrace must be exactly "ExceptionType:
  // exception message\n", otherwise jest goes mad and prints the stacktrace
  // incorrectly (once from err.message and then once from err.stack). See also:
  // https://stackoverflow.com/questions/42754270/re-throwing-exception-in-nodejs-and-not-losing-stack-trace
  const fromMessageLines = fromErr.message.split("\n").length;
  toErr.stack =
    toErr.toString() + // original toErr message
    "\n" +
    fromErr.stack
      .split("\n")
      .slice(fromMessageLines) // skip prefix=fromErr.message in fromErr.stack
      .join("\n");
  return toErr;
}

/**
 * Tries to minify a stacktrace by removing common parts of the paths. See unit
 * test with snapshot for examples.
 */
export function minifyStack(stack: string, framesToPop: number): string {
  return stack
    .replace(/^\w+:[ ]*\n/s, "") // remove "Error:" prefix
    .trim()
    .split("\n")
    .slice(framesToPop)
    .join("\n")
    .replace(/^\s+/gm, "")
    .replace(/^[^\n]+\(<anonymous>\)\n/gm, "")
    .replace(/(:\d+):\d+(?=[\n)])/gs, "$1")
    .replace(/^(at )\/.+\//gm, "$1")
    .replace(/^(at [^\n]+\()\/.+\//gm, "$1")
    .replace(/^(at )([^\n]+?) \((.+)\)/gm, "$1$3 ($2)");
}

/**
 * A simple sequence generator which never returns the same value twice within
 * the same process. It's NOT random, NOT for cryptography, NOT stored (so
 * starts from scratch on a process restart) and is NOT shared with other
 * processes.
 */
export function localUniqueInt(): number {
  return sequenceValue++;
}

let sequenceValue = 1;

/**
 * The quickest string hasher. Don't use for crypto purposes!
 * https://medium.com/@chris_72272/what-is-the-fastest-node-js-hashing-algorithm-c15c1a0e164e
 */
export function stringHash(s: string): string {
  return createHash("sha1").update(s).digest("hex");
}

/**
 * Used to calculate stable hashes of e.g. unique keys.
 */
export function objectHash(obj: object): Buffer {
  return objectHashModule(obj, {
    algorithm: "sha1",
    encoding: "buffer",
  });
}

/**
 * Similar to objectHash(), but uses JSON.stringify() under the hood, assuming
 * that it's faster than objectHash(). Also, doesn't throw when the object
 * contains bigint values (as opposed to JSON.stringify()).
 */
export function jsonHash(obj: unknown): string {
  return stringHash(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

/**
 * Indents each line of the text with 2 spaces.
 */
export function indent(message: string): string {
  return message.replace(/^/gm, "  ");
}

/**
 * Adds text suffixes to the sentence (typically, to an error message).
 */
export function addSentenceSuffixes(
  sentence: string,
  ...suffixes: Array<string | undefined>
): string {
  const compacted = compact(suffixes);
  if (compacted.length === 0) {
    return sentence;
  }

  const suffix = compacted
    .filter((suffix) => !sentence.endsWith(suffix))
    .join("");
  return suffix.startsWith("\n")
    ? sentence + suffix
    : sentence.trimEnd().replace(/[.!?]+$/s, "") + suffix;
}

/**
 * Returns the 1st line of the message.
 */
export function firstLine<T extends string | undefined>(message: T): T {
  return (
    typeof message === "string" ? message.replace(/\n.*/s, "") : message
  ) as T;
}

/**
 * A shorthand for inspect() in compact/no-break mode.
 */
export function inspectCompact(obj: unknown): string {
  return inspect(obj, { compact: true, breakLength: Infinity }).replace(
    /^([[])\s+|\s+([\]])$/gs,
    (_, $1, $2) => $1 || $2,
  );
}

/**
 * Prepares something which is claimed to be an ID for debug printing in e.g.
 * exception messages. We replace all non-ASCII characters to their \u
 * representations.
 */
export function sanitizeIDForDebugPrinting(idIn: unknown): string {
  const MAX_LEN = 32;
  const id = "" + idIn;
  const value =
    id
      .substring(0, MAX_LEN)
      // We want to use control characters in this regex.
      // eslint-disable-next-line no-control-regex
      .replace(/[^\x1F-\x7F]/g, (v) => "\\u" + v.charCodeAt(0)) +
    (id.length > MAX_LEN ? "..." : "");
  return value === "" ? '""' : value;
}

/**
 * Throws if the value passed is null or undefined.
 */
export function nullthrows<T>(
  x?: T | null,
  message?: (() => string | Error) | string | Error,
): T {
  if (x !== null && x !== undefined) {
    return x;
  }

  if (typeof message === "function") {
    message = message();
  }

  const error =
    message instanceof Error
      ? message
      : Error(message ?? `Got unexpected ${x} in nullthrows()`);
  Error.captureStackTrace(error, nullthrows);
  throw error;
}

/**
 * Two modes:
 * 1. If an async (or sync) function is passed, spawns it in background and
 *    doesn't await for its termination.
 * 2. If a Promise is passed, lets it continue executing, doesn't await on it.
 *
 * Useful when we want to launch a function "in the air", "hanging in nowhere",
 * and make no-misused-promises and no-floating-promises rules happy with it. An
 * example is some legacy callback-based API (e.g. chrome extension API) where
 * we want to pass an async function.
 *
 * It's like an analog of "async on intent" comment in the code.
 */
export function runInVoid(
  funcOrPromise: (() => Promise<unknown> | void) | Promise<unknown> | void,
): void {
  if (funcOrPromise instanceof Function) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    funcOrPromise();
  } else {
    // do nothing, our Promise is already hanging in nowhere
  }
}

/**
 * A typesafe-way to invariant the object's key presence and being
 * non-undefined. It is not always working for union types: sometimes it asserts
 * the value of the key to be "any". It also doesn't remove "undefined" from the
 * type of the value.
 */
export function hasKey<K extends symbol | string>(
  k: K,
  o: unknown,
): o is { [_ in K]: DesperateAny } {
  return (
    !!o &&
    (typeof o === "object" || typeof o === "function") &&
    k in o &&
    (o as Record<K, unknown>)[k] !== undefined
  );
}

/**
 * Same as Object.entries(), but returns strongly-typed entries.
 */
export function entries<K extends string, V>(
  obj: Partial<Record<K, V>>,
): Array<[K, V]> {
  return Object.entries(obj) as Array<[K, V]>;
}

/**
 * If the passed value is a function, calls it; otherwise, returns it intact.
 */
export function maybeCall<T>(valueOrFn: MaybeCallable<T>): T {
  return typeof valueOrFn === "function" || valueOrFn instanceof Function
    ? (valueOrFn as Function)()
    : valueOrFn;
}
