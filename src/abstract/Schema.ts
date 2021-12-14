import hash from "object-hash";
import {
  CountInput,
  InsertInput,
  LoadByInput,
  Row,
  SelectInput,
  Table,
  UniqueKey,
  UpdateInput,
} from "../types";
import { Query } from "./Query";

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

  constructor(
    /** For SQL-like databases, it's likely a table name. */
    public readonly name: string,
    /** Structure of the table. */
    public readonly table: TTable,
    /** Fields which the native unique key consists of (if any). */
    public readonly uniqueKey: TUniqueKey = [] as unknown as TUniqueKey
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

  // The API to be used by BaseEnt (which is engine-agnostic).
  abstract idGen(): Query<string>;
  abstract insert(input: InsertInput<TTable>): Query<string | null>;
  abstract upsert(input: InsertInput<TTable>): Query<string>;
  abstract delete(id: string): Query<boolean>;
  abstract load(id: string): Query<Row<TTable> | null>;
  abstract loadBy(
    input: LoadByInput<TTable, TUniqueKey>
  ): Query<Row<TTable> | null>;
  abstract update(id: string, input: UpdateInput<TTable>): Query<boolean>;
  abstract select(input: SelectInput<TTable>): Query<Array<Row<TTable>>>;
  abstract count(input: CountInput<TTable>): Query<number>;

  /**
   * Used in e.g. inverses. This casts this.constructor to SchemaClass with all
   * static methods and `new` semantic (TS doesn't do it by default; for TS,
   * x.constructor is Function).
   */
  ["constructor"]: SchemaClass;
}
