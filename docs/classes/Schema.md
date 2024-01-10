[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Schema

# Class: Schema<TTable, TUniqueKey\>

Schema is like a "table" in some database (sharded, but it's beyond the scope
of Schema). It is also a factory of Query: it knows how to build runnable
Query objects. This 2nd role is database engine specific (e.g. there might be
SQLSchema, RedisSchema etc.): such composition simplifies the code and lowers
the number of abstractions.

The set of supported Queries is opinionated and is crafted carefully to
support the minimal possible list of primitives, but at the same time, be not
too limited in the queries the DB engine can execute.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> = [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |

## Hierarchy

- **`Schema`**

  ↳ [`SQLSchema`](SQLSchema.md)

## Constructors

### constructor

• **new Schema**<`TTable`, `TUniqueKey`\>(`name`, `table`, `uniqueKey`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> = [`UniqueKey`](../modules.md#uniquekey)<`TTable`\> |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | For SQL-like databases, it's likely a table name. |
| `table` | `TTable` | Structure of the table. |
| `uniqueKey` | `TUniqueKey` | Fields which the native unique key consists of (if any). |

#### Defined in

[src/abstract/Schema.ts:119](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L119)

## Properties

### hash

• `Readonly` **hash**: `string`

#### Defined in

[src/abstract/Schema.ts:42](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L42)

___

### constructor

• **constructor**: [`SchemaClass`](../interfaces/SchemaClass.md)

Used in e.g. inverses. This casts this.constructor to SchemaClass with all
static methods and `new` semantic (TS doesn't do it by default; for TS,
x.constructor is Function).

#### Defined in

[src/abstract/Schema.ts:49](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L49)

___

### name

• `Readonly` **name**: `string`

For SQL-like databases, it's likely a table name.

#### Defined in

[src/abstract/Schema.ts:121](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L121)

___

### table

• `Readonly` **table**: `TTable`

Structure of the table.

#### Defined in

[src/abstract/Schema.ts:123](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L123)

___

### uniqueKey

• `Readonly` **uniqueKey**: `TUniqueKey`

Fields which the native unique key consists of (if any).

#### Defined in

[src/abstract/Schema.ts:125](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L125)

## Methods

### idGen

▸ `Abstract` **idGen**(): [`Query`](../interfaces/Query.md)<`string`\>

Generates a new ID for the row. Used when e.g. there is a beforeInsert
trigger on the Ent which needs to know the ID beforehand.

#### Returns

[`Query`](../interfaces/Query.md)<`string`\>

#### Defined in

[src/abstract/Schema.ts:57](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L57)

___

### insert

▸ `Abstract` **insert**(`input`): [`Query`](../interfaces/Query.md)<``null`` \| `string`\>

Creates a new row. Returns null if the row violates some unique key
constraint, otherwise returns the row ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<``null`` \| `string`\>

#### Defined in

[src/abstract/Schema.ts:63](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L63)

___

### upsert

▸ `Abstract` **upsert**(`input`): [`Query`](../interfaces/Query.md)<`string`\>

Upserts a row. Always returns the row ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<`string`\>

#### Defined in

[src/abstract/Schema.ts:68](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L68)

___

### update

▸ `Abstract` **update**(`id`, `input`): [`Query`](../interfaces/Query.md)<`boolean`\>

Updates one single row by its ID. Returns true if it actually existed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<`boolean`\>

#### Defined in

[src/abstract/Schema.ts:73](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L73)

___

### delete

▸ `Abstract` **delete**(`id`): [`Query`](../interfaces/Query.md)<`boolean`\>

Deletes a row by id. Returns true if it actually existed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`Query`](../interfaces/Query.md)<`boolean`\>

#### Defined in

[src/abstract/Schema.ts:78](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L78)

___

### load

▸ `Abstract` **load**(`id`): [`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

"Load" family of methods means that we load exactly one row. This one
returns a row by its ID or null if it's not found.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Defined in

[src/abstract/Schema.ts:84](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L84)

___

### loadBy

▸ `Abstract` **loadBy**(`input`): [`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

Loads one single row by its unique key ("by" denotes that it's based on an
unique key, not on an ID). Returns null if it's not found.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`LoadByInput`](../modules.md#loadbyinput)<`TTable`, `TUniqueKey`\> |

#### Returns

[`Query`](../interfaces/Query.md)<``null`` \| [`Row`](../modules.md#row)<`TTable`\>\>

#### Defined in

[src/abstract/Schema.ts:90](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L90)

___

### selectBy

▸ `Abstract` **selectBy**(`input`): [`Query`](../interfaces/Query.md)<[`Row`](../modules.md#row)<`TTable`\>[]\>

"Select" family of methods means that we load multiple rows ("by" denotes
that it's based on an unique key, not on an arbitrary query). This one
returns all rows whose unique key prefix matches the input.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`SelectByInput`](../modules.md#selectbyinput)<`TTable`, `TUniqueKey`\> |

#### Returns

[`Query`](../interfaces/Query.md)<[`Row`](../modules.md#row)<`TTable`\>[]\>

#### Defined in

[src/abstract/Schema.ts:99](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L99)

___

### select

▸ `Abstract` **select**(`input`): [`Query`](../interfaces/Query.md)<[`Row`](../modules.md#row)<`TTable`\>[]\>

Returns all rows matching an arbitrary query.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`SelectInput`](../modules.md#selectinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<[`Row`](../modules.md#row)<`TTable`\>[]\>

#### Defined in

[src/abstract/Schema.ts:106](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L106)

___

### count

▸ `Abstract` **count**(`input`): [`Query`](../interfaces/Query.md)<`number`\>

Returns the number of rows matching an arbitrary query.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`CountInput`](../modules.md#countinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<`number`\>

#### Defined in

[src/abstract/Schema.ts:111](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L111)

___

### exists

▸ `Abstract` **exists**(`input`): [`Query`](../interfaces/Query.md)<`boolean`\>

An optimized version of count() for the cases where we only need to know
whether at least one row exists, and don't need a precise count.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`ExistsInput`](../modules.md#existsinput)<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)<`boolean`\>

#### Defined in

[src/abstract/Schema.ts:117](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L117)
