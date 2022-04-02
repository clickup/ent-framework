import {
  IDFields,
  IDFieldsRequired,
  InsertFieldsRequired,
  Table,
} from "../types";
import {
  AfterMutationTrigger,
  AfterUpdateTrigger,
  BeforeUpdateTrigger,
  DeleteTrigger,
  DepsBuilder,
  InsertTrigger,
} from "./Triggers";
import { ValidationRules } from "./Validation";

/**
 * The table is located in the global shard (shard 0).
 */
export const GLOBAL_SHARD = "global_shard";

/**
 * The record is put in a random shard's table when inserted.
 */
export const RANDOM_SHARD = "random_shard";

/**
 * Defines Ent shard collocation to some Ent's field when this Ent is inserted.
 * The shard can either be picked randomly, be always shard 0 or be inferred
 * based on the value in other Ent fields during the insertion.
 */
export type ShardAffinity<TField extends string> =
  | readonly TField[]
  | typeof RANDOM_SHARD
  | typeof GLOBAL_SHARD;

/**
 * Strongly typed configuration framework to force TS auto-infer privacy
 * callbacks arguments types (which are not Ents, but row-like inputs).
 * 1. We MUST resolve privacyXyz rules below lazily, at actual operation; else
 *    in case of cyclic Ent dependencies between EntA and EntB, one of them will
 *    be magically undefined.
 * 2. We can’t define these parameter as BaseEnt arguments: privacy rules may
 *    refer the derived Ent itself and other Ents and thus produce cyclic
 *    dependencies. TS doesn't allow to work with such cyclic dependencies
 *    during the class is defining.
 * 3. Configuration can’t be just returned from a virtual method, because in TS,
 *    type inference in return values is poor:
 *    https://github.com/Microsoft/TypeScript/issues/31273
 */
export class Configuration<TTable extends Table> {
  readonly shardAffinity!: ShardAffinity<IDFields<TTable>>;
  readonly inverses?: {
    [k in IDFieldsRequired<TTable>]?: { name: string; type: string };
  };
  readonly privacyTenantUserIDField?: InsertFieldsRequired<TTable> & string;
  readonly privacyLoad!: ValidationRules<TTable>["load"];
  readonly privacyInsert!: ValidationRules<TTable>["insert"];
  readonly privacyUpdate?: ValidationRules<TTable>["update"];
  readonly privacyDelete?: ValidationRules<TTable>["delete"];
  readonly validators?: ValidationRules<TTable>["validate"];
  readonly beforeInsert?: Array<InsertTrigger<TTable>>;
  readonly beforeUpdate?: Array<BeforeUpdateTrigger<TTable>>;
  readonly beforeDelete?: Array<DeleteTrigger<TTable>>;
  readonly afterInsert?: Array<InsertTrigger<TTable>>;
  readonly afterUpdate?: Array<
    | AfterUpdateTrigger<TTable>
    | [DepsBuilder<TTable>, AfterUpdateTrigger<TTable>]
  >;
  readonly afterDelete?: Array<DeleteTrigger<TTable>>;
  readonly afterMutation?: Array<
    | AfterMutationTrigger<TTable>
    | [DepsBuilder<TTable>, AfterMutationTrigger<TTable>]
  >; // called after insert/update/delete

  constructor(cfg: Configuration<TTable>) {
    Object.assign(this, cfg);
  }
}
