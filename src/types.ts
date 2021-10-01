// Primary key field's name is currently hardcoded for simplicity.
export const ID = "id";

// Operators for SelectInput.
// We MUST use string versions of them and start with $, because we calculate
// the query key by doing JSON serializations, and Symbol doesn't serialize.
// This is a step back in some sense (in comparison to e.g. Sequelize).
export const $and = "$and";
export const $or = "$or";
export const $not = "$not";
export const $lte = "$<=";
export const $lt = "$<";
export const $gte = "$>=";
export const $gt = "$>";
export const $ne = "$!=";
export const $overlap = "$overlap";
export const $literal = "$literal";

// Literal operation with placeholders
export type Literal = ReadonlyArray<string | number | Date | null>;

// - Table: an object of Field:Spec
// - Field: name of the column in the table (and element of a Row)
// - Spec: detailed description of the column (type, allowNull etc.)
// - Row: an object with { Column: Value } data in it
// - Input: a subset of Row suitable for a particular write operation
// - Value: the actual data type (string, number, Date)

// { id: string }
export type RowWithID = {
  [ID]: string;
};

export type SpecType =
  | typeof Number
  | typeof String
  | typeof Boolean
  | typeof ID
  | typeof Date
  | { parse: (dbValue: any) => any; stringify: (jsValue: any) => string };

// { type: ..., ... } - one attribute spec
type Spec = {
  type: SpecType;
  allowNull?: true;
  autoInsert?: string;
  autoUpdate?: string;
};

// { id: Spec, name: Spec, ... } - table columns
export type Table = {
  [ID]: Spec;
  [K: string]: Spec;
};

// SpecType -> Value deduction (always deduces non-nullable type)
type ValueRequired<TSpec extends Spec> = TSpec["type"] extends typeof Number
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

// Spec -> nullable Value or non-nullable Value
export type Value<TSpec extends Spec> = TSpec extends { allowNull: true }
  ? ValueRequired<TSpec> | null
  : ValueRequired<TSpec>;

// Table -> Row deduction
export type Row<TTable extends Table> = RowWithID & {
  [K in keyof TTable]: K extends symbol ? never : Value<TTable[K]>;
};

// Table -> Row (with symbols) deduction
export type TriggerRow<TTable extends Table> = RowWithID & {
  [K in keyof TTable]: K extends symbol
    ? Value<TTable[K]> | undefined
    : Value<TTable[K]>;
};

// Insert: Table -> "field1" | "field2" |  ... deduction (required)
export type InsertFieldsRequired<TTable extends Table> = {
  [K in keyof TTable]: TTable[K] extends { autoInsert: any }
    ? never
    : TTable[K] extends { autoUpdate: any }
    ? never
    : K;
}[keyof TTable];

// Insert: Table -> "created_at" | "field2" |  ... deduction (optional fields)
type InsertFieldsOptional<TTable extends Table> = {
  [K in keyof TTable]: TTable[K] extends { autoInsert: any }
    ? K
    : TTable[K] extends { autoUpdate: any }
    ? K
    : never;
}[keyof TTable];

// Insert: Table -> { field: string, updated_at?: Date, created_at?: Date... }
// Excludes id Spec entirely and makes autoInsert/autoUpdate Specs optional.
export type InsertInput<TTable extends Table> = {
  [K in InsertFieldsRequired<TTable>]: Value<TTable[K]>;
} & {
  [K in InsertFieldsOptional<TTable>]?: Value<TTable[K]>;
};

// Update: Table -> "field1" | "created_at" | "updated_at" | ... deduction
type UpdateFields<TTable extends Table> = Exclude<
  keyof TTable,
  keyof RowWithID
>;

// Update: Table -> { field?: string, created_at?: Date, updated_at?: Date, ... }
// Excludes id Spec entirely and makes all fields optional.
export type UpdateInput<TTable extends Table> = {
  [K in UpdateFields<TTable>]?: Value<TTable[K]>;
} & {
  [$literal]?: Literal;
};

// Table -> ("field1" | "field2" | ...)[], list of fields allowed to compose
// an unique key on the table; fields must be allowed in insert/upsert.
export type UniqueKey<TTable extends Table> = ReadonlyArray<
  {
    [K in keyof TTable]: TTable[K] extends {
      type: typeof Number | typeof String | typeof Boolean | typeof ID;
      // allows nullable fields too!
    }
      ? K
      : never;
  }[keyof TTable]
>;

// (Table, TConcreteUniqueKey) -> "field1" | "field2" | ...
// where fields are from the concrete table and from the concrete unique key
// passed to the constructor.
type UniqueKeyFields<
  TConcreteTable extends Table,
  TConcreteUniqueKey extends UniqueKey<TConcreteTable>
> = TConcreteUniqueKey[number];

// (Table, UniqueKey) -> { field1: number, field2: number, ... }
// loadBy operation is allowed for exact unique key attributes only.
export type LoadByInput<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>
> = TUniqueKey extends never[]
  ? never
  : { [K in UniqueKeyFields<TTable, TUniqueKey>]: Value<TTable[K]> };

// Table -> "user_id" | "some_id" | ...
export type IDFields<TTable extends Table> = {
  [K in keyof TTable]: K extends string
    ? TTable[K] extends { type: typeof ID }
      ? K
      : never
    : never;
}[keyof TTable];

// Table -> "user_id" | "some_id" | ...
export type IDFieldsRequired<TTable extends Table> =
  InsertFieldsRequired<TTable> & IDFields<TTable>;

// A hack (see comments below).
type WhereWithoutNot<TTable extends Table> = {
  [$and]?: ReadonlyArray<Where<TTable>>;
  [$or]?: ReadonlyArray<Where<TTable>>;
  //[$not]?: Where<TTable>; - DO NOT put it here, it crashes TS > v3.5.3
  [$literal]?: Literal;
} & {
  [K in keyof TTable]?: K extends symbol
    ? never
    :
        | Value<TTable[K]>
        | ReadonlyArray<Value<TTable[K]>>
        | { [$lte]: NonNullable<Value<TTable[K]>> }
        | { [$lt]: NonNullable<Value<TTable[K]>> }
        | { [$gte]: NonNullable<Value<TTable[K]>> }
        | { [$gt]: NonNullable<Value<TTable[K]>> }
        | { [$overlap]: NonNullable<Value<TTable[K]>> }
        | { [$ne]: Value<TTable[K]> | ReadonlyArray<Value<TTable[K]>> };
};

// Table -> { f: 10, [$or]: [ { f2: "a }, { f3: "b""} ], $literal: ["x=?", 1] }
export type Where<TTable extends Table> = {
  // There is a bug in TS > v3.5.3 which they don't fix for a long time, because
  // they (and we) don't know how to reproduce it in a wild. Although TS
  // perfectly supports recursive types, if we just put "[$not]?: Where<TTable>"
  // to here, we'll get a "Maximum call stack size exceeded" error. Removing "?"
  // stops the crash (but it's not what we want), also removing "?" in "[P in
  // keyof TTable]" above stops the crash too.
  //
  // So it's a little trade-off hack for now: we may not have $not inside a
  // $not. It's still better than saying e.g. "[$not]?: any".
  [$not]?: WhereWithoutNot<TTable>;
} & WhereWithoutNot<TTable>;

// Table -> [["f1", "ASC"], ["f2", "DESC"]] or [ [{[$literal]: ["a=?", 10]}, "ASC"], ["b", "DESC"] ]
export type Order<TTable> = ReadonlyArray<
  { [K in keyof TTable]?: string } & {
    [$literal]?: Literal;
  }
>;

// Table -> { where: ..., order?: ..., ... }
export type SelectInput<TTable extends Table> = {
  where: Where<TTable>;
  order?: Order<TTable>;
  custom?: {}; // custom engine-defined parameters/modifiers
  limit: number; // required - for safety
};

// Table -> { f: 10, [$or]: [ { f2: "a }, { f3: "b""} ], $literal: ["x=?", 1] }
export type CountInput<TTable extends Table> = Where<TTable>;

// Table -> { id: ["1", "2", "3"], ... }
export type DeleteWhereInput<TTable extends Table> = { [ID]: string[] } & Omit<
  Where<TTable>,
  typeof ID
>;
