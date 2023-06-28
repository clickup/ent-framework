import type { Schema } from "../abstract/Schema";
import type {
  CountInput,
  ExistsInput,
  ID,
  InsertInput,
  LoadByInput,
  Order,
  Table,
  UniqueKey,
  UpdateInput,
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
    order?: Order<TTable>
  ): Promise<Array<Ent<TTable>>>;
  selectChunked(
    vc: VC,
    where: Where<TTable>,
    chunkSize: number,
    limit: number,
    custom?: {}
  ): AsyncIterableIterator<Array<Ent<TTable>>>;
  loadByX(
    vc: VC,
    keys: LoadByInput<TTable, UniqueKey<TTable>>
  ): Promise<Ent<TTable>>;
  insert(vc: VC, input: InsertInput<TTable>): Promise<string>;
}

/**
 * A very shallow interface of one Ent.
 */
export interface Ent<TTable extends Table = any> {
  readonly [ID]: string;
  readonly vc: VC;
  deleteOriginal(): Promise<boolean>;
  updateOriginal(input: UpdateInput<TTable>): Promise<boolean>;
}
