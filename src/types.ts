// Primary key field's name is currently hardcoded for simplicity.
export const ID = "id";

/**
 * Literal operation with placeholders.
 */
export type Literal = ReadonlyArray<string | number | Date | null>;

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
  | { parse: (dbValue: any) => any; stringify: (jsValue: any) => string };

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
 * (Table) -> "field1" | "field2" | ... where the union contains only fields
 * which can potentially be used as a part of unique key.
 */
export type FieldOfPotentialUniqueKey<TTable extends Table> = {
  [K in Field<TTable>]: TTable[K] extends {
    type: typeof Number | typeof String | typeof Boolean | typeof ID;
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
    : TSpec["type"] extends { parse: (dbValue: any) => infer TJSValue }
    ? TJSValue
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
  [K in keyof TTable]: TTable[K] extends { autoInsert: any }
    ? never
    : TTable[K] extends { autoUpdate: any }
    ? never
    : K;
}[keyof TTable];

/**
 * Insert: Table -> "created_at" | "field2" |  ... deduction (optional fields).
 */
export type InsertFieldsOptional<TTable extends Table> = {
  [K in keyof TTable]: TTable[K] extends { autoInsert: any }
    ? K
    : TTable[K] extends { autoUpdate: any }
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
export type UpdateFields<TTable extends Table> = Exclude<
  keyof TTable,
  keyof RowWithID
>;

/**
 * Update: Table -> { field?: string, created_at?: Date, updated_at?: Date }.
 * Excludes id Spec entirely and makes all fields optional.
 */
export type UpdateInput<TTable extends Table> = {
  [K in UpdateFields<TTable>]?: Value<TTable[K]>;
} & {
  $literal?: Literal;
};

/**
 * Table -> ["field1", "field2", ...], list of fields allowed to compose an
 * unique key on the table; fields must be allowed in insert/upsert.
 */
export type UniqueKey<TTable extends Table> =
  | []
  | [
      FieldOfPotentialUniqueKey<TTable>,
      ...Array<FieldOfPotentialUniqueKey<TTable>>
    ];

/**
 * (Table, UniqueKey) -> { field1: number, field2: number, ... }. loadBy
 * operation is allowed for exact unique key attributes only.
 */
export type LoadByInput<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>
> = TUniqueKey extends []
  ? never
  : { [K in TUniqueKey[number]]: Value<TTable[K]> };

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
