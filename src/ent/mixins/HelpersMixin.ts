import { Client } from "../../abstract/Client";
import { AddNew, OmitNew } from "../../helpers";
import {
  ID,
  InsertInput,
  LoadByInput,
  Row,
  Table,
  UniqueKey,
  UpdateInput,
} from "../../types";
import { EntAccessError } from "../errors/EntAccessError";
import { EntNotFoundError } from "../errors/EntNotFoundError";
import { EntUniqueKeyError } from "../errors/EntUniqueKeyError";
import { VC } from "../VC";
import { PrimitiveClass, PrimitiveInstance } from "./PrimitiveMixin";

export interface HelpersInstance<TTable extends Table>
  extends PrimitiveInstance<TTable> {
  /**
   * Same as updateOriginal(), but updates only the fields which are different
   * in input and in the current object. If nothing is different, returns
   * false.
   */
  updateChanged(input: UpdateInput<TTable>): Promise<boolean>;

  /**
   * Same as updateOriginal(), but returns the updated Ent (or null of there
   * was no such Ent in the database).
   */
  updateReturningNullable<TEnt extends HelpersInstance<TTable>>(
    this: TEnt,
    input: UpdateInput<TTable>
  ): Promise<TEnt | null>;

  /**
   * Same as updateOriginal(), but throws if the object wasn't updated or
   * doesn't exist after the update.
   */
  updateReturningX<TEnt extends HelpersInstance<TTable>>(
    this: TEnt,
    input: UpdateInput<TTable>
  ): Promise<TEnt>;
}

export interface HelpersClass<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
  TClient extends Client
> extends OmitNew<PrimitiveClass<TTable, TUniqueKey, TClient>> {
  /**
   * Same as insertIfNotExists(), but throws if the Ent violates unique key
   * constraints.
   */
  insert: (vc: VC, input: InsertInput<TTable>) => Promise<string>;

  /**
   * Same as insert(), but returns the created Ent.
   */
  insertReturning: <TEnt extends HelpersInstance<TTable>>(
    this: new (...args: any[]) => TEnt,
    vc: VC,
    input: InsertInput<TTable>
  ) => Promise<TEnt>;

  /**
   * Same, but returns the created/updated Ent.
   */
  upsertReturning: <TEnt extends HelpersInstance<TTable>>(
    this: new (...args: any[]) => TEnt,
    vc: VC,
    input: InsertInput<TTable>
  ) => Promise<TEnt>;

  /**
   * Same as loadNullable(), but if no permissions to read, returns null and
   * doesn't throw. It's more a convenience function rather than a concept.
   */
  loadIfReadableNullable: <TEnt extends HelpersInstance<TTable>>(
    this: new (...args: any[]) => TEnt,
    vc: VC,
    id: string
  ) => Promise<TEnt | null>;

  /**
   * Loads an Ent by its ID. Throws if no such Ent is found.
   * This method is used VERY often.
   */
  loadX: <TEnt extends HelpersInstance<TTable>>(
    this: new (...args: any[]) => TEnt,
    vc: VC,
    id: string
  ) => Promise<TEnt>;

  /**
   * Loads an Ent by its ID. Throws if no such Ent is found.
   * This method is used VERY often.
   */
  loadByX: <TEnt extends HelpersInstance<TTable>>(
    this: new (...args: any[]) => TEnt,
    vc: VC,
    input: LoadByInput<TTable, TUniqueKey>
  ) => Promise<TEnt>;

  /**
   * TS requires us to have a public constructor to infer instance types in
   * various places. We make this constructor throw if it's called.
   */
  new (...args: any[]): HelpersInstance<TTable> & Row<TTable>;
}

/**
 * Modifies the passed class adding convenience methods (like loadX() which
 * throws when an Ent can't be loaded instead of returning null as it's done in
 * the primitive operations).
 */
export function HelpersMixin<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
  TClient extends Client
>(Base: PrimitiveClass<TTable, TUniqueKey, TClient>) {
  class HelpersMixin extends Base {
    override ["constructor"]!: typeof HelpersMixin;

    static async insert(vc: VC, input: InsertInput<TTable>) {
      const id = await this.insertIfNotExists(vc, input);
      if (!id) {
        throw new EntUniqueKeyError(this.name, input);
      }

      return id;
    }

    static async insertReturning(vc: VC, input: InsertInput<TTable>) {
      const id = await this.insert(vc, input);
      return this.loadX(vc, id);
    }

    static async upsertReturning(vc: VC, input: InsertInput<TTable>) {
      const id = await this.upsert(vc, input);
      return this.loadX(vc, id);
    }

    static async loadIfReadableNullable(vc: VC, id: string) {
      try {
        return await this.loadNullable(vc, id);
      } catch (e: any) {
        if (e instanceof EntAccessError) {
          return null;
        }

        throw e;
      }
    }

    static async loadX(vc: VC, id: string) {
      const ent = await this.loadNullable(vc, id);
      if (!ent) {
        throw new EntNotFoundError(this.name, id);
      }

      return ent;
    }

    static async loadByX(vc: VC, input: LoadByInput<TTable, TUniqueKey>) {
      const ent = await this.loadByNullable(vc, input);
      if (!ent) {
        throw new EntNotFoundError(this.name, input);
      }

      return ent;
    }

    async updateChanged(input: UpdateInput<TTable>) {
      let numChangedAttrs = 0;
      const changedAttrs: UpdateInput<TTable> = {};

      // Iterate over BOTH regular fields AND symbol fields. Notice that for
      // symbol fields, we'll always have a "changed" signal since the input Ent
      // doesn't have them (they are to be used in triggers only).
      for (const key of Reflect.ownKeys(this.constructor.SCHEMA.table)) {
        const field = key as unknown as keyof typeof input;
        const value = input[field];
        const existingValue = (this as any)[field];

        // Undefined is treated as "do not touch" signal for the field.
        if (value === undefined) {
          continue;
        }

        // ID field is always treated as immutable.
        if (field === ID) {
          continue;
        }

        // Exact equality means "do not touch".
        if (existingValue === value) {
          continue;
        }

        // Works for most of Node built-in types: Date, Buffer, as well as for
        // user-defined custom types.
        if (
          value !== null &&
          typeof value === "object" &&
          existingValue !== null &&
          typeof existingValue === "object" &&
          JSON.stringify(value) === JSON.stringify(existingValue)
        ) {
          continue;
        }

        // There IS a change in this field. Record it.
        changedAttrs[field] = value;
        numChangedAttrs++;
      }

      if (numChangedAttrs > 0) {
        return this.updateOriginal(changedAttrs);
      }

      return false;
    }

    async updateReturningNullable(input: UpdateInput<TTable>) {
      const updated = await this.updateOriginal(input);
      return updated ? this.constructor.loadNullable(this.vc, this[ID]) : null;
    }

    async updateReturningX(input: UpdateInput<TTable>) {
      const res = await this.updateReturningNullable(input);
      if (!res) {
        throw new EntNotFoundError(this.constructor.name, this[ID]);
      }

      return res;
    }
  }

  return HelpersMixin as AddNew<
    typeof HelpersMixin,
    Row<TTable>
  > as HelpersClass<TTable, TUniqueKey, TClient>;
}
