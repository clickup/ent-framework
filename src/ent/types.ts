import type { Schema } from "../abstract/Schema";
import type {
  CountInput,
  ExistsInput,
  ID,
  LoadByInput,
  Order,
  Table,
  UniqueKey,
  Where,
} from "../types";
import type { Validation } from "./Validation";
import type { VC } from "./VC";

/**
 * A very shallow interface of Ent class (as a collection of static methods).
 * Used in some places where we need the very minimum from the Ent.
 */
export interface EntClass<TTable extends Table = any> {
  readonly SCHEMA: Schema<TTable>;
  readonly VALIDATION: Validation<TTable>;
  readonly name: string; // class constructor name

  new (): Ent;
  loadX(vc: VC, id: string): Promise<Ent>;
  loadNullable(vc: VC, id: string): Promise<Ent | null>;
  loadIfReadableNullable(vc: VC, id: string): Promise<Ent | null>;
  count(vc: VC, where: CountInput<TTable>): Promise<number>;
  exists(vc: VC, where: ExistsInput<TTable>): Promise<boolean>;
  select(
    vc: VC,
    where: Where<TTable>,
    limit: number,
    order?: Order<TTable>
  ): Promise<Ent[]>;
  selectChunked(
    vc: VC,
    where: Where<TTable>,
    chunkSize: number,
    limit: number,
    custom?: {}
  ): AsyncIterableIterator<Ent[]>;
  loadByX(vc: VC, keys: LoadByInput<TTable, UniqueKey<TTable>>): Promise<Ent>;
}

/**
 * A very shallow interface of one Ent.
 */
export interface Ent {
  readonly [ID]: string;
  readonly vc: VC;
  deleteOriginal(): Promise<boolean>;
}
