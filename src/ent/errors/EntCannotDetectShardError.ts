import { inspect } from "util";

/**
 * Error: when the system cannot detect the target shard to work with
 * (e.g. an Ent doesn't refer to any other Ent with shard affinity).
 */
export class EntCannotDetectShardError extends Error {
  constructor(
    public readonly schemaName: string,
    public readonly op: string,
    public readonly fields: readonly string[],
    public readonly input: any,
    public readonly shardAffinity: any,
    public readonly inverseFields?: string[]
  ) {
    super(
      `${schemaName}: to detect shard in "${op}" query, ` +
        (fields.length > 1 ? "at least one of " : "") +
        `"${fields.join(", ")}" field` +
        (fields.length !== 1 ? "s" : "") +
        " must be present at TOP LEVEL of the input, but got " +
        inspect(input, { breakLength: Infinity }) +
        `; ${schemaName}.SHARD_AFFINITY=` +
        inspect(shardAffinity, { compact: true, breakLength: Infinity }) +
        (inverseFields
          ? `; ${schemaName}.INVERSES=${inverseFields.join(",")}`
          : "")
    );
    this.name = this.constructor.name;
  }
}
