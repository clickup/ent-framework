import { inspect } from "util";

/**
 * Error: when the system cannot detect the target shard to work with (e.g. an
 * Ent doesn't refer to any other Ent with shard affinity).
 *
 * Throwing of this error signals about a bug in the code, so it is not
 * user-facing (thus, not derived from EntAccessError).
 */
export class EntCannotDetectShardError extends Error {
  constructor(
    public readonly entName: string,
    public readonly op: string,
    public readonly fields: readonly string[],
    public readonly input: any,
    public readonly shardAffinity: any,
    public readonly inverseFields?: string[]
  ) {
    super(
      `${entName}: to detect shard in "${op}" query, ` +
        (fields.length > 1 ? "at least one of " : "") +
        `non-empty "${fields.join(", ")}" field` +
        (fields.length !== 1 ? "s" : "") +
        " must be present at TOP LEVEL of the input, but got " +
        inspect(input, { breakLength: Infinity }) +
        `; ${entName}.SHARD_AFFINITY=` +
        inspect(shardAffinity, { compact: true, breakLength: Infinity }) +
        (inverseFields
          ? `; ${entName}.INVERSES=` +
            inspect(inverseFields, { compact: true, breakLength: Infinity })
          : "")
    );
    this.name = this.constructor.name;
  }
}
