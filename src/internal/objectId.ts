const $OBJECT_ID = Symbol("$OBJECT_ID");
let seq = 0;

/**
 * Mimics the behavior of Python's `id()` function. The idea is that often times
 * we can't use e.g. obj.constructor.name, because it got mangled by e.g.
 * UglifyJS during bundling. But to build cache keys, we still need some
 * per-object identifier.
 */
export function objectId(objIn: object): number {
  const obj = objIn as { [$OBJECT_ID]?: number };
  return (obj[$OBJECT_ID] ??= seq++);
}
