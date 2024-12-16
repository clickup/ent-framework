[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Schema

# Class: `abstract` Schema\<TTable, TUniqueKey\>

Schema is like a "table" in some database (sharded, but it's beyond the scope
of Schema). It is also a factory of Query: it knows how to build runnable
Query objects. This 2nd role is database engine specific (e.g. there might be
PgSchema, RedisSchema etc.): such composition simplifies the code and lowers
the number of abstractions.

The set of supported Queries is opinionated and is crafted carefully to
support the minimal possible list of primitives, but at the same time, be not
too limited in the queries the DB engine can execute.

## Extended by

- [`PgSchema`](PgSchema.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) | - |
| `TUniqueKey` *extends* [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> | [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> |

## Constructors

### new Schema()

> **new Schema**\<`TTable`, `TUniqueKey`\>(`name`, `table`, `uniqueKey`): [`Schema`](Schema.md)\<`TTable`, `TUniqueKey`\>

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | For relational databases, it's likely a table name. |
| `table` | `TTable` | Structure of the table. |
| `uniqueKey` | `TUniqueKey` | Fields which the native unique key consists of (if any). |

#### Returns

[`Schema`](Schema.md)\<`TTable`, `TUniqueKey`\>

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

> `abstract` **idGen**(): [`Query`](../interfaces/Query.md)\<`string`\>

Generates a new ID for the row. Used when e.g. there is a beforeInsert
trigger on the Ent which needs to know the ID beforehand.

#### Returns

[`Query`](../interfaces/Query.md)\<`string`\>

#### Defined in

[src/abstract/Schema.ts:57](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L57)

***

### insert()

> `abstract` **insert**(`input`): [`Query`](../interfaces/Query.md)\<`null` \| `string`\>

Creates a new row. Returns null if the row violates some unique key
constraint, otherwise returns the row ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`null` \| `string`\>

#### Defined in

[src/abstract/Schema.ts:63](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L63)

***

### upsert()

> `abstract` **upsert**(`input`): [`Query`](../interfaces/Query.md)\<`string`\>

Upserts a row. Always returns the row ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`string`\>

#### Defined in

[src/abstract/Schema.ts:68](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L68)

***

### update()

> `abstract` **update**(`id`, `input`): [`Query`](../interfaces/Query.md)\<`boolean`\>

Updates one single row by its ID. Returns true if it actually existed.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`boolean`\>

#### Defined in

[src/abstract/Schema.ts:73](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L73)

***

### delete()

> `abstract` **delete**(`id`): [`Query`](../interfaces/Query.md)\<`boolean`\>

Deletes a row by id. Returns true if it actually existed.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

[`Query`](../interfaces/Query.md)\<`boolean`\>

#### Defined in

[src/abstract/Schema.ts:78](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L78)

***

### load()

> `abstract` **load**(`id`): [`Query`](../interfaces/Query.md)\<`null` \| [`Row`](../type-aliases/Row.md)\<`TTable`\>\>

"Load" family of methods means that we load exactly one row. This one
returns a row by its ID or null if it's not found.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

[`Query`](../interfaces/Query.md)\<`null` \| [`Row`](../type-aliases/Row.md)\<`TTable`\>\>

#### Defined in

[src/abstract/Schema.ts:84](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L84)

***

### loadBy()

> `abstract` **loadBy**(`input`): [`Query`](../interfaces/Query.md)\<`null` \| [`Row`](../type-aliases/Row.md)\<`TTable`\>\>

Loads one single row by its unique key ("by" denotes that it's based on an
unique key, not on an ID). Returns null if it's not found.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`LoadByInput`](../type-aliases/LoadByInput.md)\<`TTable`, `TUniqueKey`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`null` \| [`Row`](../type-aliases/Row.md)\<`TTable`\>\>

#### Defined in

[src/abstract/Schema.ts:90](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L90)

***

### selectBy()

> `abstract` **selectBy**(`input`): [`Query`](../interfaces/Query.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

"Select" family of methods means that we load multiple rows ("by" denotes
that it's based on an unique key, not on an arbitrary query). This one
returns all rows whose unique key prefix matches the input.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`SelectByInput`](../type-aliases/SelectByInput.md)\<`TTable`, `TUniqueKey`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

#### Defined in

[src/abstract/Schema.ts:99](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L99)

***

### select()

> `abstract` **select**(`input`): [`Query`](../interfaces/Query.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

Returns all rows matching an arbitrary query.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`SelectInput`](../type-aliases/SelectInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

#### Defined in

[src/abstract/Schema.ts:106](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L106)

***

### count()

> `abstract` **count**(`input`): [`Query`](../interfaces/Query.md)\<`number`\>

Returns the number of rows matching an arbitrary query.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`CountInput`](../type-aliases/CountInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`number`\>

#### Defined in

[src/abstract/Schema.ts:111](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L111)

***

### exists()

> `abstract` **exists**(`input`): [`Query`](../interfaces/Query.md)\<`boolean`\>

An optimized version of count() for the cases where we only need to know
whether at least one row exists, and don't need a precise count.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ExistsInput`](../type-aliases/ExistsInput.md)\<`TTable`\> |

#### Returns

[`Query`](../interfaces/Query.md)\<`boolean`\>

#### Defined in

[src/abstract/Schema.ts:117](https://github.com/clickup/ent-framework/blob/master/src/abstract/Schema.ts#L117)
