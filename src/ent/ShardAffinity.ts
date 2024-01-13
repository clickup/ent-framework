import type { ID } from "../types";

/**
 * The table is located in the global Shard (0).
 */
export const GLOBAL_SHARD = "global_shard";

/**
 * Defines Ent Shard collocation to some Ent's field when this Ent is inserted.
 * - The Shard can always be Shard 0 ("global Shard"), be inferred based on the
 *   value in other Ent field during the insertion ("colocation"), or, in case
 *   colocation inference didn't succeed, be chosen pseudo-randomly at insertion
 *   time ("random Shard").
 * - E.g. a random Shard can also be chosen in case an empty array is passed to
 *   Shard affinity (like "always fallback"), or when a field's value points to
 *   a global Shard.
 * - Passing ID to ShardAffinity is prohibited by TS.
 */
export type ShardAffinity<
  TField extends string,
  TF = Exclude<TField, typeof ID>,
> =
  | typeof GLOBAL_SHARD
  | (TField extends typeof ID ? readonly TF[] : readonly [TF, ...TF[]]);
