import { Schema } from "../abstract/Schema";
import {
  CountInput,
  LoadByInput,
  Order,
  Table,
  UniqueKey,
  Where,
} from "../types";
import { Validation } from "./Validation";
import { VC } from "./VC";

/**
 * A very shallow interface of Ent class (as a collection of static methods).
 * User in some places where we need the very minimum from the Ent.
 */
export interface EntClass<TTable extends Table = any> {
  readonly SCHEMA: Schema<TTable>;
  readonly VALIDATION: Validation<TTable>;
  readonly name: string; // class constructor name

  loadX(vc: VC, id: string): Promise<Ent>;
  loadNullable(vc: VC, id: string): Promise<Ent | null>;
  loadIfReadableNullable(vc: VC, id: string): Promise<Ent | null>;
  count(vc: VC, where: CountInput<TTable>): Promise<number>;
  select(
    vc: VC,
    where: Where<TTable>,
    limit: number,
    order?: Order<TTable>
  ): Promise<Ent[]>;
  loadByX(vc: VC, keys: LoadByInput<TTable, UniqueKey<TTable>>): Promise<Ent>;
}

/**
 * A very shallow interface of one Ent.
 */
export interface Ent {
  readonly id: string;
  readonly vc: VC;
  deleteOriginal(): Promise<boolean>;
}
