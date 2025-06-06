import type { DesperateAny, TuplePrefixes } from "./internal/misc";

/**
 * Primary key field's name is currently hardcoded for simplicity. It's a
 * convention to have it named as "id".
 */
export const ID = "id";

/**
 * Literal operation with placeholders. We don't use a tuple type here (like
 * `[string, ...T[]]`), because it would force us to use `as const` everywhere,
 * which we don't want to do.
 */
export type Literal = Array<
  | string
  | number
  | boolean
  | Date
  | null
  | Array<string | number | boolean | Date | null>
>;

// - Table: an object of Field:Spec
// - Field: name of the column in the table (and element of a Row)
// - Spec: detailed description of the column (type, allowNull etc.)
// - Row: an object with { Column: Value } data in it
// - Input: a subset of Row suitable for a particular write operation
// - Value: the actual data type (string, number, Date)

/**
 * { id: string }
 */
export type RowWithID = {
  [ID]: string;
};

/**
 * Spec (metadata) of some field.
 */
export type SpecType =
  | typeof Boolean
  | typeof Date
  | typeof ID
  | typeof Number
  | typeof String
  | {
      /** Converts a value of some field returned by the low-level DB engine to
       * its Client representation, which can be reacher (e.g. support
       * encryption/decryption). Notice that some DB engines already do some
       * conversions internally: e.g. for node-postgres and an array field,
       * dbValue returned by the engine is already an array of things, so
       * dbValueToJs for it will likely do nothing. */
      dbValueToJs: (dbValue: DesperateAny) => unknown;
      /** Converts a Client value to the internal stringified representation of
       * the low-level DB engine, which is suitable for injecting it into a
       * plaintext query (with e.g. ?-placeholders).
       * - Notice that this is intentionally NOT the opposite to dbValueToJs,
       *   because it always needs to convert the value to a string, not to the
       *   DB engine's row field type.
       * - Example: node-postgres natively understands json/jsonb PG types and
       *   can unescape them (called "PG type parsers" and mainly lives in
       *   pg-types module; notice that there are no "PG type stringifiers
       *   though"). The problem is that the low-level library's facilities for
       *   escaping data is poor or doesn't exist (we do escaping by ourselves
       *   for various reasons, like batching queries and better logging). So we
       *   trust the library on the dbValueToJs path, but must manually
       *   serialize on stringify path. */
      stringify: (jsValue: DesperateAny) => string;
      /** The opposite to stringify function. Generally, it is not used on the
       * read path (because the low level engine returns the rows suitable for
       * dbValueToJs), but it's still here for completeness of the interface. */
      parse: (str: string) => unknown;
    };

/**
 * { type: ..., ... } - one attribute spec.
 */
export type Spec = {
  type: SpecType;
  allowNull?: true;
  autoInsert?: string;
  autoUpdate?: string;
};

/**
 * { id: Spec, name: Spec, ... } - table columns.
 */
export type Table = {
  [K: string | symbol]: Spec;
};

/**
 * A database table's field (no symbols). In regards to some table structure,
 * there can be 3 options:
 * 1. Field<TTable>: only DB-stored attributes, no ephemeral symbols
 * 2. keyof TTable: both real and ephemeral attributes
 * 3. keyof TTable & symbol: only "ephemeral" attributes available to triggers
 *
 * By doing `& string`, we ensure that we select only regular (non-symbol)
 * fields.
 */
export type Field<TTable extends Table> = keyof TTable & string;

/**
 * Same as Field, but may optionally hold information about of "alias value
 * source" for a field name (e.g. `{ field: "abc", alias: "$cas.abc" }`).
 */
export type FieldAliased<TTable extends Table> =
  | Field<TTable>
  | { field: Field<TTable>; alias: string };

/**
 * (Table) -> "field1" | "field2" | ... where the union contains only fields
 * which can potentially be used as a part of unique key.
 */
export type FieldOfPotentialUniqueKey<TTable extends Table> = {
  [K in Field<TTable>]: TTable[K] extends {
    type:
      | typeof Number
      | typeof String
      | typeof Boolean
      | typeof ID
      | typeof Date
      | { dbValueToJs: (dbValue: never) => string | number };
    // allows nullable fields too!
  }
    ? K
    : never;
}[Field<TTable>];

/**
 * Table -> "user_id" | "some_id" | ...
 */
export type FieldOfIDType<TTable extends Table> = {
  [K in Field<TTable>]: K extends string
    ? TTable[K] extends { type: typeof ID }
      ? K
      : never
    : never;
}[Field<TTable>];

/**
 * Table -> "user_id" | "some_id" | ...
 */
export type FieldOfIDTypeRequired<TTable extends Table> =
  InsertFieldsRequired<TTable> & FieldOfIDType<TTable>;

/**
 * SpecType -> Value deduction (always deduces non-nullable type).
 */
export type ValueRequired<TSpec extends Spec> =
  TSpec["type"] extends typeof Number
    ? number
    : TSpec["type"] extends typeof String
      ? string
      : TSpec["type"] extends typeof Boolean
        ? boolean
        : TSpec["type"] extends typeof ID
          ? string
          : TSpec["type"] extends typeof Date
            ? Date
            : TSpec["type"] extends {
                  dbValueToJs: (dbValue: never) => infer TJSValue;
                }
              ? TSpec["type"] extends {
                  stringify: (jsValue: TJSValue) => string;
                  parse: (str: string) => TJSValue;
                }
                ? TJSValue
                : never
              : never;

/**
 * Spec -> nullable Value or non-nullable Value.
 */
export type Value<TSpec extends Spec> = TSpec extends { allowNull: true }
  ? ValueRequired<TSpec> | null
  : ValueRequired<TSpec>;

/**
 * Table -> Row deduction (no symbols).
 */
export type Row<TTable extends Table> = RowWithID & {
  [K in Field<TTable>]: Value<TTable[K]>;
};

/**
 * Insert: Table -> "field1" | "field2" |  ... deduction (required).
 */
export type InsertFieldsRequired<TTable extends Table> = {
  [K in keyof TTable]: TTable[K] extends { autoInsert: unknown }
    ? never
    : TTable[K] extends { autoUpdate: unknown }
      ? never
      : K;
}[keyof TTable];

/**
 * Insert: Table -> "created_at" | "field2" |  ... deduction (optional fields).
 */
export type InsertFieldsOptional<TTable extends Table> = {
  [K in keyof TTable]: TTable[K] extends { autoInsert: unknown }
    ? K
    : TTable[K] extends { autoUpdate: unknown }
      ? K
      : never;
}[keyof TTable];

/**
 * Insert: Table -> { field: string, updated_at?: Date, created_at?: Date... }.
 * Excludes id Spec entirely and makes autoInsert/autoUpdate Specs optional.
 */
export type InsertInput<TTable extends Table> = {
  [K in InsertFieldsRequired<TTable>]: Value<TTable[K]>;
} & {
  [K in InsertFieldsOptional<TTable>]?: Value<TTable[K]>;
};

/**
 * Update: Table -> "field1" | "created_at" | "updated_at" | ... deduction.
 */
export type UpdateField<TTable extends Table> = Exclude<
  keyof TTable,
  keyof RowWithID
>;

/**
 * Update: Table -> { field?: string, created_at?: Date, updated_at?: Date }.
 * - Excludes id Spec entirely and makes all fields optional.
 * - If $literal is passed, it will be appended to the list of updating fields
 *   (engine specific).
 * - If $cas is passed, only the rows whose fields match the exact values in
 *   $cas will be updated; the non-matching rows will be skipped.
 */
export type UpdateInput<TTable extends Table> = {
  [K in UpdateField<TTable>]?: Value<TTable[K]>;
} & {
  $literal?: Literal;
  $cas?: { [K in UpdateField<TTable>]?: Value<TTable[K]> };
};

/**
 * Table -> ["field1", "field2", ...], list of fields allowed to compose an
 * unique key on the table; fields must be allowed in insert/upsert.
 */
export type UniqueKey<TTable extends Table> =
  | []
  | [
      FieldOfPotentialUniqueKey<TTable>,
      ...Array<FieldOfPotentialUniqueKey<TTable>>,
    ];

/**
 * (Table, UniqueKey) -> { field1: number, field2: number, field3: number }.
 * loadBy operation is allowed for exact unique key attributes only.
 */
export type LoadByInput<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
> = TUniqueKey extends []
  ? never
  : { [K in TUniqueKey[number]]: Value<TTable[K]> };

/**
 * (Table, UniqueKey) -> { field1: number [, field2: number [, ...] ] }.
 * selectBy operation is allowed for unique key PREFIX attributes only.
 */
export type SelectByInput<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
> = LoadByInput<TTable, TuplePrefixes<TUniqueKey>>;

/**
 * Table -> { f: 10, [$or]: [ { f2: "a }, { f3: "b""} ], $literal: ["x=?", 1] }
 */
export type Where<TTable extends Table> = {
  // Block operators for SelectInput. We MUST use string versions of them and
  // start with $, because we calculate the query key by doing JSON
  // serializations, and Symbol doesn't serialize. This is a step back in some
  // sense (in comparison to e.g. Sequelize).
  //
  // Example: { $op: { field: "value" } }
  $and?: ReadonlyArray<Where<TTable>>;
  $or?: ReadonlyArray<Where<TTable>>;
  $not?: Where<TTable>;
  $literal?: Literal;
  $shardOfID?: string;
} & {
  [ID]?: TTable extends { [ID]: unknown } ? unknown : string | string[];
} & {
  [K in Field<TTable>]?:
    | Value<TTable[K]>
    | ReadonlyArray<Value<TTable[K]>>
    // Field comparison operators for SelectInput.
    //
    // Example: { field: { $op: "value" } }
    | { $lte: NonNullable<Value<TTable[K]>> }
    | { $lt: NonNullable<Value<TTable[K]>> }
    | { $gte: NonNullable<Value<TTable[K]>> }
    | { $gt: NonNullable<Value<TTable[K]>> }
    | { $overlap: NonNullable<Value<TTable[K]>> }
    | { $ne: Value<TTable[K]> | ReadonlyArray<Value<TTable[K]>> }
    | { $isDistinctFrom: Value<TTable[K]> };
};

/**
 * Table -> [["f1", "ASC"], ["f2", "DESC"]] or [ [{[$literal]: ["a=?", 10]},
 * "ASC"], ["b", "DESC"] ]
 */
export type Order<TTable extends Table> = ReadonlyArray<
  { [K in Field<TTable>]?: string } & { $literal?: Literal }
>;

/**
 * Table -> { where: ..., order?: ..., ... }
 */
export type SelectInput<TTable extends Table> = {
  where: Where<TTable>;
  order?: Order<TTable>;
  custom?: {}; // custom engine-defined parameters/modifiers
  limit: number; // required - for safety
};

/**
 * Table -> { f: 10, [$or]: [ { f2: "a }, { f3: "b""} ], $literal: ["x=?", 1] }
 */
export type CountInput<TTable extends Table> = Where<TTable>;

/**
 * Table -> { f: 10, [$or]: [ { f2: "a }, { f3: "b""} ], $literal: ["x=?", 1] }
 */
export type ExistsInput<TTable extends Table> = Where<TTable>;

/**
 * Table -> { id: ["1", "2", "3"], ... }
 */
export type DeleteWhereInput<TTable extends Table> = { [ID]: string[] } & Omit<
  Where<TTable>,
  typeof ID
>;

/**
 * Planner hints. Null means "reset to the engine's default", and "undefined"
 * means the same as "no key mentioned at all".
 */
export type Hints = Record<string, string | null | undefined>;

/**
 * A wrapper for literal union types, suitable for the following Spec:
 * - { type: EnumType<"a" | "b" | "c">() }
 * - { type: EnumType<1 | 2 | 3>() }
 */
export function EnumType<TValue extends string | number>(): {
  dbValueToJs: (dbValue: string | number) => TValue;
  stringify: (jsValue: TValue) => string;
  parse: (str: string) => TValue;
};

/**
 * A wrapper for literal union types, suitable for the following Spec:
 * ```
 * enum MyEnum {
 *   A = "a",
 *   B = "b",
 * }
 * ...
 * { type: EnumType<MyEnum>() }
 * ```
 */
export function EnumType<TEnum extends Record<string, string | number>>(): {
  dbValueToJs: (dbValue: string | number) => TEnum[keyof TEnum];
  stringify: (jsValue: TEnum[keyof TEnum]) => string;
  parse: (str: string) => TEnum[keyof TEnum];
};

/** @ignore */
export function EnumType(): unknown {
  return {
    dbValueToJs: (dbValue: string | number) => dbValue,
    stringify: (jsValue: never) => jsValue as string,
    parse: (str: string) => str,
  } as const;
}

/**
 * A value stored in the DB as a base64 encoded binary buffer. Actually, DB
 * engines (like PostgreSQL) support native binary data fields (and store binary
 * data efficiently), but sometimes (especially for small things, like
 * public/private keys), it's easier to store the binary data as base64 encoded
 * strings rather than dealing with the native binary data type.
 */
export function Base64BufferType(): {
  dbValueToJs: (dbValue: string) => Buffer;
  stringify: (jsValue: Buffer) => string;
  parse: (str: string) => Buffer;
} {
  return {
    dbValueToJs: (dbValue) => Buffer.from(dbValue, "base64"),
    stringify: (jsValue) => jsValue.toString("base64"),
    parse: (str) => Buffer.from(str, "base64"),
  };
}

/**
 * A JSON-serializable value.
 */
export type JSONValue =
  | null
  | string
  | number
  | boolean
  | JSONValue[]
  | { [k in string]?: JSONValue };

/**
 * An arbitrary JSON field type.
 */
export function JSONType<TCurrent extends JSONValue>(): {
  dbValueToJs: (dbValue: TCurrent) => TCurrent;
  stringify: (jsValue: TCurrent) => string;
  parse: (str: string) => TCurrent;
} {
  return {
    dbValueToJs: (dbValue) => dbValue,
    stringify: (jsValue) => JSON.stringify(jsValue),
    parse: (str) => JSON.parse(str),
  };
}
