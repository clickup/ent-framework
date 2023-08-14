import type { ID, FieldOfIDType, FieldOfIDTypeRequired, Table } from "../types";
import type {
  AfterMutationTrigger,
  AfterUpdateTrigger,
  BeforeMutationTrigger,
  BeforeUpdateTrigger,
  DeleteTrigger,
  DepsBuilder,
  InsertTrigger,
} from "./Triggers";
import type { Validation, ValidationRules } from "./Validation";

/**
 * The table is located in the global shard (shard 0).
 */
export const GLOBAL_SHARD = "global_shard";

/**
 * Defines Ent shard collocation to some Ent's field when this Ent is inserted.
 * The shard can always be shard 0 ("global shard"), be inferred based on the
 * value in other Ent field during the insertion ("colocation"), or, in case
 * colocation inference didn't succeed, be chosen pseudo-randomly at insertion
 * time ("random shard"). E.g. a random shard can also be chosen in case an
 * empty array is passed to shard affinity (like "always fallback"), or when a
 * field's value points to a global shard.
 */
export type ShardAffinity<
  TField extends string,
  TF = Exclude<TField, typeof ID>
> =
  | typeof GLOBAL_SHARD
  | (TField extends typeof ID ? readonly TF[] : readonly [TF, ...TF[]]);

/**
 * Strongly typed configuration framework to force TS auto-infer privacy
 * callbacks arguments types (which are not Ents, but row-like inputs).
 *
 * Motivation:
 * 1. We MUST resolve privacyXyz rules below lazily, at actual operation;
 *    otherwise in case of cyclic Ent dependencies between EntA and EntB, one of
 *    them will be magically undefined.
 * 2. We can’t define these parameter as BaseEnt arguments: privacy rules may
 *    refer the derived Ent itself and other Ents and thus produce cyclic
 *    dependencies. TS doesn't allow to work with such cyclic dependencies
 *    during the class is defining.
 * 3. Configuration can’t be just returned from a virtual method, because in TS,
 *    type inference in return values is poor:
 *    https://github.com/Microsoft/TypeScript/issues/31273
 */
export class Configuration<TTable extends Table> {
  /** Defines how to locate a shard at Ent insert time. See ShardAffinity for
   * more details.
   *
   * 1. GLOBAL_SHARD: places the Ent in the global shard (shard 0).
   * 2. []: places the Ent in a random shard. The "randomness" of the "random
   *    shard" is deterministic by the Ent's unique key at the moment of
   *    insertion (if it's defined; otherwise completely random). This helps two
   *    racy insert operations running concurrently to choose the same shard for
   *    the Ent to be created in, so only one of them will win, instead of both
   *    winning and mistakenly creating the Ent duplicates. I.e. having the same
   *    value in unique key forces the engine to target the same "random" shard.
   * 3. ["field1", "field2", ...]: places the Ent in the shard that is pointed
   *    to by the value in field1 (if it's null, then field2 etc.).
   *
   * A special treatment is applied if a fieldN value in (3) points to the
   * global shard. In such a case, the shard for the current Ent is chosen
   * deterministic-randomly at insert time, as if [] is passed. This allows the
   * Ent to refer other "owning" Ents of different types, some of which may be
   * located in the global shard. Keep in mind that, to locate such an Ent
   * pointing to another Ent in the global shard, an inverse for fieldN must be
   * defined in most of the cases. */
  readonly shardAffinity!: ShardAffinity<FieldOfIDType<TTable>>;
  /** Inverses allow cross-shard foreign keys & cross-shard selection. If a
   * field points to an Ent in another shard, and we're e.g. selecting by a
   * value in this field, inverses allow to locate shard(s) of the Ent. */
  readonly inverses?: {
    [k in FieldOfIDTypeRequired<TTable>]?: { name: string; type: string };
  };
  /** If defined, forces all Ents of this class to have the value of that field
   * equal to VC's principal at load time. This is a very 1st unavoidable check
   * in the privacy rules chain, thus it's bullet-proof. */
  readonly privacyTenantPrincipalField?: Validation<TTable>["tenantPrincipalField"];
  /** If defined, an attempt to load this Ent using an omni VC will "lower" that
   * VC to the principal returned by this callback. Omni VC is always lowered,
   * even if the callback is not set (to a guest VC in such cases). */
  readonly privacyInferPrincipal?: Validation<TTable>["inferPrincipal"];
  /** Privacy rules checked on every row loaded from the DB. */
  readonly privacyLoad!: ValidationRules<TTable>["load"];
  /** Privacy rules checked before a row is inserted to the DB. If no
   * update/delete rules are defined, then these rules are also run on
   * update/delete by default. */
  readonly privacyInsert!: ValidationRules<TTable>["insert"];
  /** Privacy rules checked before a row is updated in the DB. If not defined,
   * privacyInsert rules are used.  */
  readonly privacyUpdate?: ValidationRules<TTable>["update"];
  /** Privacy rules checked before a row is deleted in the DB. If not defined,
   * privacyUpdate (or privacyInsert) rules are used.  */
  readonly privacyDelete?: ValidationRules<TTable>["delete"];
  /** Custom field values validators run before any insert/update. */
  readonly validators?: ValidationRules<TTable>["validate"];
  /** Triggers run before every insert. */
  readonly beforeInsert?: Array<InsertTrigger<TTable>>;
  /** Triggers run before every update. */
  readonly beforeUpdate?: Array<
    | BeforeUpdateTrigger<TTable>
    | [DepsBuilder<TTable>, BeforeUpdateTrigger<TTable>]
  >;
  /** Triggers run before every delete. */
  readonly beforeDelete?: Array<DeleteTrigger<TTable>>;
  /** Triggers run before every insert/update/delete. Each trigger may also be
   * passed as "React useEffect-like" tuple where the callback is executed only
   * if the deps are modified. */
  readonly beforeMutation?: Array<
    | BeforeMutationTrigger<TTable>
    | [DepsBuilder<TTable>, BeforeMutationTrigger<TTable>]
  >;
  /** Triggers run after every delete. */
  readonly afterInsert?: Array<InsertTrigger<TTable>>;
  /** Triggers run after every update. */
  readonly afterUpdate?: Array<
    | AfterUpdateTrigger<TTable>
    | [DepsBuilder<TTable>, AfterUpdateTrigger<TTable>]
  >;
  /** Triggers run after every delete. */
  readonly afterDelete?: Array<DeleteTrigger<TTable>>;
  /** Triggers run after every insert/update/delete. Each trigger may also be
   * passed as "React useEffect-like" tuple where the callback is executed only
   * if the deps are modified. */
  readonly afterMutation?: Array<
    | AfterMutationTrigger<TTable>
    | [DepsBuilder<TTable>, AfterMutationTrigger<TTable>]
  >;

  constructor(cfg: Configuration<TTable>) {
    Object.assign(this, cfg);
  }
}
