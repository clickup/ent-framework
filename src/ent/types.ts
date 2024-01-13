import type { Client } from "../abstract/Client";
import type { Schema } from "../abstract/Schema";
import type { DesperateAny } from "../internal/misc";
import type {
  CountInput,
  ExistsInput,
  ID,
  InsertInput,
  Literal,
  LoadByInput,
  Order,
  Table,
  UniqueKey,
  UpdateField,
  UpdateInput,
  Value,
  Where,
} from "../types";
import type { ShardLocator } from "./ShardLocator";
import type { Validation } from "./Validation";
import type { VC } from "./VC";

/**
 * A very shallow interface of Ent class (as a collection of static methods).
 * Used in some places where we need the very minimum from the Ent.
 */
export type EntClass<TTable extends Table = DesperateAny> = {
  readonly SCHEMA: Schema<TTable>;
  readonly VALIDATION: Validation<TTable>;
  readonly SHARD_LOCATOR: ShardLocator<Client, TTable, string>;
  readonly name: string; // class constructor name

  new (): Ent<TTable>;
  loadX(vc: VC, id: string): Promise<Ent<TTable>>;
  loadNullable(vc: VC, id: string): Promise<Ent<TTable> | null>;
  loadIfReadableNullable(vc: VC, id: string): Promise<Ent<TTable> | null>;
  count(vc: VC, where: CountInput<TTable>): Promise<number>;
  exists(vc: VC, where: ExistsInput<TTable>): Promise<boolean>;
  select(
    vc: VC,
    where: Where<TTable>,
    limit: number,
    order?: Order<TTable>,
  ): Promise<Array<Ent<TTable>>>;
  selectChunked(
    vc: VC,
    where: Where<TTable>,
    chunkSize: number,
    limit: number,
    custom?: {},
  ): AsyncIterableIterator<Array<Ent<TTable>>>;
  loadByX(
    vc: VC,
    keys: LoadByInput<TTable, UniqueKey<TTable>>,
  ): Promise<Ent<TTable>>;
  loadByNullable(
    vc: VC,
    input: LoadByInput<TTable, UniqueKey<TTable>>,
  ): Promise<Ent<TTable> | null>;
  insert(vc: VC, input: InsertInput<TTable>): Promise<string>;
  upsert(vc: VC, input: InsertInput<TTable>): Promise<string>;
};

/**
 * A very shallow interface of one Ent.
 */
export type Ent<TTable extends Table = {}> = {
  readonly [ID]: string;
  readonly vc: VC;
  deleteOriginal(): Promise<boolean>;
  updateOriginal(input: UpdateOriginalInput<TTable>): Promise<boolean>;
};

/**
 * The input of updateOriginal() method. It supports some additional syntax
 * sugar for $cas property, so to work-around TS weakness of Omit<> & type
 * inference, we redefine this type from scratch.
 */
export type UpdateOriginalInput<TTable extends Table> = {
  [K in UpdateField<TTable>]?: Value<TTable[K]>;
} & {
  $literal?: Literal;
  $cas?:
    | "skip-if-someone-else-changed-updating-ent-props"
    | ReadonlyArray<UpdateField<TTable>>
    | UpdateInput<TTable>["$cas"];
};
