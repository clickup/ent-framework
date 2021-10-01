/**
 * A simple intrusive 1-slot cache memoization helper for 2 parameters
 * functions. It's useful when we have a very high chance of hit rate and is
 * faster (and more memory efficient) than a Map<TArg1, Map<TArg2, TResult>>
 * based approach since it doesn't create intermediate maps.
 *
 * This method works seamlessly for async functions too: the returned Promise is
 * eagerly memoized, so all the callers will subscribe to the same Promise.
 */
export default function memoize2<TTag extends symbol, TArg1, TArg2, TResult>(
  obj: object,
  tag: TTag,
  func: (arg1: TArg1, arg2: TArg2) => TResult
): typeof func {
  if (!obj.hasOwnProperty(tag)) {
    let arg1Cache: TArg1;
    let arg2Cache: TArg2;
    let resultCache: TResult;
    Object.defineProperty(obj, tag, {
      enumerable: false,
      writable: false,
      value: (arg1: TArg1, arg2: TArg2) => {
        if (arg1Cache !== arg1 || arg2Cache !== arg2) {
          arg1Cache = arg1;
          arg2Cache = arg2;
          resultCache = func(arg1, arg2);
        }

        return resultCache;
      },
    });
  }

  return (obj as any)[tag];
}
