/**
 * This non-retriable error is thrown when the system cannot detect the target
 * shard to work with (e.g. a null ID or a missing field or something else).
 */
export class ShardError extends Error {
  constructor(message: string, where?: string) {
    super(message);

    Object.defineProperty(this, "name", {
      value: this.constructor.name,
      writable: true,
      enumerable: false,
    });

    if (where) {
      this.stack += `\n    on ${where}`;
    }
  }
}
