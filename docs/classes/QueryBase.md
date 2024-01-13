[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / QueryBase

# Class: QueryBase\<TTable, TInput, TOutput, TClient\>

A convenient base class for most (but not all) of the queries, where the
Runner instance is the same for different query input shapes. If the query
doesn't fit the QueryBase framework (like PgQueryUpdate for instance where we
have separate Runner instances for separate set of updated fields), a Query
is used directly instead.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TInput` | `TInput` |
| `TOutput` | `TOutput` |
| `TClient` | extends [`Client`](Client.md) |

## Hierarchy

- **`QueryBase`**

  ↳ [`PgQueryCount`](PgQueryCount.md)

  ↳ [`PgQueryDelete`](PgQueryDelete.md)

  ↳ [`PgQueryDeleteWhere`](PgQueryDeleteWhere.md)

  ↳ [`PgQueryExists`](PgQueryExists.md)

  ↳ [`PgQueryIDGen`](PgQueryIDGen.md)

  ↳ [`PgQueryInsert`](PgQueryInsert.md)

  ↳ [`PgQueryLoad`](PgQueryLoad.md)

  ↳ [`PgQueryLoadBy`](PgQueryLoadBy.md)

  ↳ [`PgQuerySelect`](PgQuerySelect.md)

  ↳ [`PgQueryUpsert`](PgQueryUpsert.md)

## Implements

- [`Query`](../interfaces/Query.md)\<`TOutput`\>

## Constructors

### constructor

• **new QueryBase**\<`TTable`, `TInput`, `TOutput`, `TClient`\>(`schema`, `input`): [`QueryBase`](QueryBase.md)\<`TTable`, `TInput`, `TOutput`, `TClient`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TInput` | `TInput` |
| `TOutput` | `TOutput` |
| `TClient` | extends [`Client`](Client.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\> |
| `input` | `TInput` |

#### Returns

[`QueryBase`](QueryBase.md)\<`TTable`, `TInput`, `TOutput`, `TClient`\>

#### Defined in

[src/abstract/QueryBase.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L28)

## Properties

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\>

#### Defined in

[src/abstract/QueryBase.ts:29](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L29)

___

### input

• `Readonly` **input**: `TInput`

#### Defined in

[src/abstract/QueryBase.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L30)

## Accessors

### IS\_WRITE

• `get` **IS_WRITE**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[Query](../interfaces/Query.md).[IS_WRITE](../interfaces/Query.md#is_write)

#### Defined in

[src/abstract/QueryBase.ts:33](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L33)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`\<`TOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `TClient` |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`TOutput`\>

#### Implementation of

[Query](../interfaces/Query.md).[run](../interfaces/Query.md#run)

#### Defined in

[src/abstract/QueryBase.ts:37](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L37)
