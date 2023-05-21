import hash from "object-hash";
import type {
  CountInput,
  ExistsInput,
  InsertInput,
  LoadByInput,
  Row,
  SelectByInput,
  SelectInput,
  Table,
  UniqueKey,
  UpdateInput,
} from "../types";
import type { Query } from "./Query";

export interface SchemaClass {
  new <
    TTable extends Table,
    TUniqueKey extends UniqueKey<TTable> = UniqueKey<TTable>
  >(
    name: string,
    table: TTable,
    uniqueKey?: TUniqueKey
  ): Schema<TTable, TUniqueKey>;
}

/**
 * Schema is like a "table" in some database (sharded, but it's beyond the scope
 * of Schema). It is also a factory of Query: it knows how to build runnable
 * Query objects. This 2nd role is database engine specific (e.g. there might be
 * SQLSchema, RedisSchema etc.): such composition simplifies the code and lowers
 * the number of abstractions.
 *
 * The set of supported Queries is opinionated and is crafted carefully to
 * support the minimal possible list of primitives, but at the same time, be not
 * too limited in the queries the DB engine can execute.
 */
export abstract class Schema<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable> = UniqueKey<TTable>
> {
  readonly hash: string;

  /**
   * Used in e.g. inverses. This casts this.constructor to SchemaClass with all
   * static methods and `new` semantic (TS doesn't do it by default; for TS,
   * x.constructor is Function).
   */
  ["constructor"]!: SchemaClass;

  // Below is the API to be used by BaseEnt (which is engine-agnostic).

  /**
   * Generates a new ID for the row. Used when e.g. there is a beforeInsert
   * trigger on the Ent which needs to know the ID beforehand.
   */
  abstract idGen(): Query<string>;

  /**
   * Creates a new row. Returns null if the row violates some unique key
   * constraint, otherwise returns the row ID.
   */
  abstract insert(input: InsertInput<TTable>): Query<string | null>;

  /**
   * Upserts a row. Always returns the row ID.
   */
  abstract upsert(input: InsertInput<TTable>): Query<string>;

  /**
   * Updates one single row by its ID. Returns true if it actually existed.
   */
  abstract update(id: string, input: UpdateInput<TTable>): Query<boolean>;

  /**
   * Deletes a row by id. Returns true if it actually existed.
   */
  abstract delete(id: string): Query<boolean>;

  /**
   * "Load" family of methods means that we load exactly one row. This one
   * returns a row by its ID or null if it's not found.
   */
  abstract load(id: string): Query<Row<TTable> | null>;

  /**
   * Loads one single row by its unique key ("by" denotes that it's based on an
   * unique key, not on an ID). Returns null if it's not found.
   */
  abstract loadBy(
    input: LoadByInput<TTable, TUniqueKey>
  ): Query<Row<TTable> | null>;

  /**
   * "Select" family of methods means that we load multiple rows ("by" denotes
   * that it's based on an unique key, not on an arbitrary query). This one
   * returns all rows whose unique key prefix matches the input.
   */
  abstract selectBy(
    input: SelectByInput<TTable, TUniqueKey>
  ): Query<Array<Row<TTable>>>;

  /**
   * Returns all rows matching an arbitrary query.
   */
  abstract select(input: SelectInput<TTable>): Query<Array<Row<TTable>>>;

  /**
   * Returns the number of rows matching an arbitrary query.
   */
  abstract count(input: CountInput<TTable>): Query<number>;

  /**
   * An optimized version of count() for the cases where we only need to know
   * whether at least one row exists, and don't need a precise count.
   */
  abstract exists(input: ExistsInput<TTable>): Query<boolean>;

  constructor(
    /** For SQL-like databases, it's likely a table name. */
    public readonly name: string,
    /** Structure of the table. */
    public readonly table: TTable,
    /** Fields which the native unique key consists of (if any). */
    public readonly uniqueKey: TUniqueKey
  ) {
    if (!Object.keys(this.table).length) {
      throw Error("Must have at least one field");
    }

    for (const field of this.uniqueKey) {
      if (this.table[field].autoUpdate) {
        throw Error(
          "All fields in upsert unique key list must be non-auto-updatable"
        );
      }
    }

    for (const field of Object.keys(this.table)) {
      if (!field.match(/^[_a-z][_a-z0-9]*$/)) {
        throw Error(
          `Field name must be a simple identifier, but '${field}' passed`
        );
      }
    }

    this.hash =
      this.name +
      ":" +
      hash([this.table, this.uniqueKey], {
        algorithm: "md5",
        ignoreUnknown: true,
      });
  }
}
