import { createHash } from "crypto";

/**
 * Turns a list of Promises to a list of Promise resolution results.
 */
export async function join<TList extends readonly unknown[]>(
  promises: TList
): Promise<{ -readonly [P in keyof TList]: Awaited<TList[P]> }>;

/**
 * Turns an object where some values are Promises to an object with values as
 * Promise resolution results.
 */
export async function join<TRec extends Readonly<Record<string, unknown>>>(
  promises: TRec
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
 *    and issue SQL queries as if nothing happened).
 * 2. Predictable control flow: if we run `await join()`, we know that no side
 *    effects from the spawned promises will appear after this await throws or
 *    returns.
 *
 * "Join" is a term from parallel programming (e.g. "join threads"), it’s pretty
 * concrete and means that after the call, multiple parallel execution flows
 * “join” into one. It's a word to describe having "one" from "many".
 *
 * What’s interesting is that, besides Promise-all leaks execution flows, it
 * still doesn’t trigger UnhandledPromiseRejection for them in case one of them
 * throws later, it just swallows all other exceptions.
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
  const errorsArray: unknown[] = [];
  const resultsArray = await Promise["all"](
    promisesArray.map(async (promise) =>
      Promise.resolve(promise).catch((err) => {
        errorsArray.push(err);
        return undefined;
      })
    )
  );
  if (errorsArray.length > 0) {
    throw errorsArray[0];
  } else {
    return promises instanceof Array
      ? resultsArray
      : Object.fromEntries(
          Object.keys(promises).map((key, i) => [key, resultsArray[i]])
        );
  }
}

/**
 * A shortcut for `await join(arr.map(async ...))`.
 */
export async function mapJoin<TElem, TRet>(
  arr: readonly TElem[] | Promise<readonly TElem[]>,
  func: (e: TElem, idx: number) => PromiseLike<TRet> | TRet
): Promise<TRet[]> {
  return join((await arr).map((e, idx) => func(e, idx)));
}

/**
 * Removes constructor signature from a type.
 * https://github.com/microsoft/TypeScript/issues/40110#issuecomment-747142570
 */
export type OmitNew<T extends new (...args: any[]) => any> = Pick<T, keyof T>;

/**
 * Adds a type alternative to constructor signature's return value. This is
 * useful when we e.g. turn an instance of some Ent class into an Instance & Row
 * type where Row is dynamically inferred from the schema.
 */
export type AddNew<
  TClass extends new (...args: any[]) => any,
  TRet
> = OmitNew<TClass> & { new (): InstanceType<TClass> & TRet };

/**
 * Flattens the interface to make it more readable in IntelliSense. Can be used
 * when someone modifies (picks, omits, etc.) a huge type.
 */
export type Flatten<T> = {} & { [P in keyof T]: T[P] };

/**
 * A wrapper around process.hrtime() to quickly calculate time deltas.
 */
export function toFloatMs(elapsed: [number, number]) {
  return elapsed[0] * 1e3 + elapsed[1] / 1e6;
}

/**
 * Same as toFloatMs(), but returns seconds.
 */
export function toFloatSec(elapsed: [number, number]) {
  return elapsed[0] + elapsed[1] / 1e9;
}

/**
 * Copies a stack-trace from fromErr error into toErr object. Useful for
 * lightweight exceptions wrapping.
 */
export function copyStack(toErr: Error, fromErr: Error) {
  // This is magic, the 1st line in stacktrace must be exactly "ExceptionType:
  // exception message\n", else jest goes mad and prints the stacktrace
  // incorrectly (once from err.message and then once from err.stack). See also:
  // https://stackoverflow.com/questions/42754270/re-throwing-exception-in-nodejs-and-not-losing-stack-trace
  if (!fromErr.stack) {
    return toErr;
  }

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
export function minifyStack(stack: string, framesToPop: number) {
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

export function hash(s: string) {
  // Don't use for crypto purposes!
  // https://medium.com/@chris_72272/what-is-the-fastest-node-js-hashing-algorithm-c15c1a0e164e
  return createHash("sha1").update(s).digest("base64");
}

/**
 * Indents each line of the text with 2 spaces.
 */
export function indent(message: string) {
  return message.replace(/^/gm, "  ");
}

/**
 * Prepares something which is claimed to be an ID for debug printing in e.g.
 * exception messages. We replace all non-ASCII characters to their \u
 * representations.
 */
export function sanitizeIDForDebugPrinting(idIn: any) {
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

export function nullthrows<T>(x?: T | null, message?: string | Error): T {
  if (x !== null && x !== undefined) {
    return x;
  }

  const error =
    message instanceof Error
      ? message
      : new Error(message ?? `Got unexpected ${x} in nullthrows()`);
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
  funcOrPromise: (() => Promise<unknown> | void) | Promise<unknown> | void
) {
  if (funcOrPromise instanceof Function) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    funcOrPromise();
  } else {
    // do nothing, our Promise is already hanging in nowhere
  }
}

/**
 * A typesafe-way to invariant the object's key presence.
 */
export function hasKey<K extends symbol | string>(
  k: K,
  o: any
): o is { [_ in K]: any } {
  return o && (typeof o === "object" || typeof o === "function") && k in o;
}

/**
 * Same as Object.entries(), but returns strongly-typed entries.
 */
export function entries<K extends string, V>(obj: Partial<Record<K, V>>) {
  return Object.entries(obj) as Array<[K, V]>;
}
