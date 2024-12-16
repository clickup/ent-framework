[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgSchema

# Class: PgSchema\<TTable, TUniqueKey\>

Schema is like a "table" in some database (sharded, but it's beyond the scope
of Schema). It is also a factory of Query: it knows how to build runnable
Query objects. This 2nd role is database engine specific (e.g. there might be
PgSchema, RedisSchema etc.): such composition simplifies the code and lowers
the number of abstractions.

The set of supported Queries is opinionated and is crafted carefully to
support the minimal possible list of primitives, but at the same time, be not
too limited in the queries the DB engine can execute.

## Extends

- [`Schema`](Schema.md)\<`TTable`, `TUniqueKey`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> |

## Constructors

### new PgSchema()

> **new PgSchema**\<`TTable`, `TUniqueKey`\>(`name`, `table`, `uniqueKey`): [`PgSchema`](PgSchema.md)\<`TTable`, `TUniqueKey`\>

Used in e.g. inverses. This casts this.constructor to SchemaClass with all
static methods and `new` semantic (TS doesn't do it by default; for TS,
x.constructor is Function).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | For relational databases, it's likely a table name. |
| `table` | `TTable` | Structure of the table. |
| `uniqueKey` | `TUniqueKey` | Fields which the native unique key consists of (if any). |

#### Returns

[`PgSchema`](PgSchema.md)\<`TTable`, `TUniqueKey`\>

#### Inherited from

[`Schema`](Schema.md).[`constructor`](Schema.md#constructors)

#### Defined in

[src/abstract/Schema.ts:119](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L119)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `hash` | `string` | - |
| `constructor` | [`SchemaClass`](../interfaces/SchemaClass.md) | Used in e.g. inverses. This casts this.constructor to SchemaClass with all static methods and `new` semantic (TS doesn't do it by default; for TS, x.constructor is Function). |
| `name` | `string` | For relational databases, it's likely a table name. |
| `table` | `TTable` | Structure of the table. |
| `uniqueKey` | `TUniqueKey` | Fields which the native unique key consists of (if any). |

## Methods

### idGen()

> **idGen**(): [`Query`](../interfaces/Query.md)\<`string`\>

Generates a new ID for the row. Used when e.g. there is a beforeInsert
trigger on the Ent which needs to know the ID beforehand.

#### Returns

[`Query`](../interfaces/Query.md)\<`string`\>

#### Overrides

[`Schema`](Schema.md).[`idGen`](Schema.md#idgen)

#### Defined in

[src/pg/PgSchema.ts:31](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L31)

***

### insert()

> **insert**(`input`): [`Query`](../interfaces/Query.md)\<`null` \| `string`\>

Creates a new row. Returns null if the row violates some unique key
constraint, otherwise returns the row ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`null` \| `string`\>

#### Overrides

[`Schema`](Schema.md).[`insert`](Schema.md#insert)

#### Defined in

[src/pg/PgSchema.ts:35](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L35)

***

### upsert()

> **upsert**(`input`): [`Query`](../interfaces/Query.md)\<`string`\>

Upserts a row. Always returns the row ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`string`\>

#### Overrides

[`Schema`](Schema.md).[`upsert`](Schema.md#upsert)

#### Defined in

[src/pg/PgSchema.ts:39](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L39)

***

### update()

> **update**(`id`, `input`): [`Query`](../interfaces/Query.md)\<`boolean`\>

Updates one single row by its ID. Returns true if it actually existed.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`boolean`\>

#### Overrides

[`Schema`](Schema.md).[`update`](Schema.md#update)

#### Defined in

[src/pg/PgSchema.ts:43](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L43)

***

### delete()

> **delete**(`id`): [`Query`](../interfaces/Query.md)\<`boolean`\>

Deletes a row by id. Returns true if it actually existed.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

[`Query`](../interfaces/Query.md)\<`boolean`\>

#### Overrides

[`Schema`](Schema.md).[`delete`](Schema.md#delete)

#### Defined in

[src/pg/PgSchema.ts:47](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L47)

***

### load()

> **load**(`id`): [`Query`](../interfaces/Query.md)\<`null` \| [`Row`](../type-aliases/Row.md)\<`TTable`\>\>

"Load" family of methods means that we load exactly one row. This one
returns a row by its ID or null if it's not found.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

[`Query`](../interfaces/Query.md)\<`null` \| [`Row`](../type-aliases/Row.md)\<`TTable`\>\>

#### Overrides

[`Schema`](Schema.md).[`load`](Schema.md#load)

#### Defined in

[src/pg/PgSchema.ts:51](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L51)

***

### loadBy()

> **loadBy**(`input`): [`Query`](../interfaces/Query.md)\<`null` \| [`Row`](../type-aliases/Row.md)\<`TTable`\>\>

Loads one single row by its unique key ("by" denotes that it's based on an
unique key, not on an ID). Returns null if it's not found.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`LoadByInput`](../type-aliases/LoadByInput.md)\<`TTable`, `TUniqueKey`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`null` \| [`Row`](../type-aliases/Row.md)\<`TTable`\>\>

#### Overrides

[`Schema`](Schema.md).[`loadBy`](Schema.md#loadby)

#### Defined in

[src/pg/PgSchema.ts:55](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L55)

***

### selectBy()

> **selectBy**(`input`): [`Query`](../interfaces/Query.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

"Select" family of methods means that we load multiple rows ("by" denotes
that it's based on an unique key, not on an arbitrary query). This one
returns all rows whose unique key prefix matches the input.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`SelectByInput`](../type-aliases/SelectByInput.md)\<`TTable`, `TUniqueKey`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

#### Overrides

[`Schema`](Schema.md).[`selectBy`](Schema.md#selectby)

#### Defined in

[src/pg/PgSchema.ts:59](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L59)

***

### select()

> **select**(`input`): [`Query`](../interfaces/Query.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

Returns all rows matching an arbitrary query.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`SelectInput`](../type-aliases/SelectInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

#### Overrides

[`Schema`](Schema.md).[`select`](Schema.md#select)

#### Defined in

[src/pg/PgSchema.ts:65](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L65)

***

### count()

> **count**(`input`): [`Query`](../interfaces/Query.md)\<`number`\>

Returns the number of rows matching an arbitrary query.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`CountInput`](../type-aliases/CountInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`number`\>

#### Overrides

[`Schema`](Schema.md).[`count`](Schema.md#count)

#### Defined in

[src/pg/PgSchema.ts:69](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L69)

***

### exists()

> **exists**(`input`): [`Query`](../interfaces/Query.md)\<`boolean`\>

An optimized version of count() for the cases where we only need to know
whether at least one row exists, and don't need a precise count.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ExistsInput`](../type-aliases/ExistsInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`boolean`\>

#### Overrides

[`Schema`](Schema.md).[`exists`](Schema.md#exists)

#### Defined in

[src/pg/PgSchema.ts:73](https://github.com/clickup/ent-framework/blob/master/src/pg/PgSchema.ts#L73)
