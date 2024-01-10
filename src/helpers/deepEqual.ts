/**
 * Inspired by https://github.com/epoberezkin/fast-deep-equal
 *
 * The original implementation treats objects with absent keys and the keys with
 * undefined values as different, but these objects should be considered the same
 * to perform proper comparison in Ent Framework.
 *
 * THE ORIGINAL COPYRIGHT NOTICE:
 * --------------------------------------------------------------------------------
 * MIT License
 *
 * Copyright (c) 2017 Evgeny Poberezkin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Deep compares a and b ignoring the order of keys in objects and keys with
 * undefined values.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (a && b && typeof a === "object" && typeof b === "object") {
    if (a.constructor !== b.constructor) {
      return false;
    }

    let i;
    if (Array.isArray(a) && Array.isArray(b)) {
      const length = a.length;
      if (length !== b.length) {
        return false;
      }

      for (i = length; i-- !== 0; ) {
        if (!deepEqual(a[i], b[i])) {
          return false;
        }
      }

      return true;
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) {
        return false;
      }

      for (i of a.entries()) {
        if (!b.has(i[0])) {
          return false;
        }
      }

      for (i of a.entries()) {
        if (!deepEqual(i[1], b.get(i[0]))) {
          return false;
        }
      }

      return true;
    }

    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) {
        return false;
      }

      for (i of a.entries()) {
        if (!b.has(i[0])) {
          return false;
        }
      }

      return true;
    }

    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      const length = a.byteLength;
      if (length !== b.byteLength) {
        return false;
      }

      return Buffer.from(a.buffer, 0).equals(Buffer.from(b.buffer, 0));
    }

    if (a instanceof ArrayBuffer && b instanceof ArrayBuffer) {
      const length = a.byteLength;
      if (length !== b.byteLength) {
        return false;
      }

      return Buffer.from(a, 0).equals(Buffer.from(b, 0));
    }

    if (a instanceof RegExp && b instanceof RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }

    if (a.valueOf !== Object.prototype.valueOf) {
      return a.valueOf() === b.valueOf();
    }

    if (a.toString !== Object.prototype.toString) {
      return a.toString() === b.toString();
    }

    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      if (
        !deepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        )
      ) {
        return false;
      }
    }

    return true;
  }

  // True if both NaN, false otherwise.
  return a !== a && b !== b;
}
