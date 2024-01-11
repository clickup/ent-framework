[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / QueryBase

# Class: QueryBase<TTable, TInput, TOutput, TClient\>

A convenient base class for most (but not all) of the queries, where the
Runner instance is the same for different query input shapes. If the query
doesn't fit the QueryBase framework (like SQLQueryUpdate for instance where
we have separate Runner instances for separate set of updated fields), a
Query is used directly instead.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TInput` | `TInput` |
| `TOutput` | `TOutput` |
| `TClient` | extends [`Client`](Client.md) |

## Hierarchy

- **`QueryBase`**

  ↳ [`SQLQueryCount`](SQLQueryCount.md)

  ↳ [`SQLQueryDelete`](SQLQueryDelete.md)

  ↳ [`SQLQueryDeleteWhere`](SQLQueryDeleteWhere.md)

  ↳ [`SQLQueryExists`](SQLQueryExists.md)

  ↳ [`SQLQueryIDGen`](SQLQueryIDGen.md)

  ↳ [`SQLQueryInsert`](SQLQueryInsert.md)

  ↳ [`SQLQueryLoad`](SQLQueryLoad.md)

  ↳ [`SQLQueryLoadBy`](SQLQueryLoadBy.md)

  ↳ [`SQLQuerySelect`](SQLQuerySelect.md)

  ↳ [`SQLQueryUpsert`](SQLQueryUpsert.md)

## Implements

- [`Query`](../interfaces/Query.md)<`TOutput`\>

## Constructors

### constructor

• **new QueryBase**<`TTable`, `TInput`, `TOutput`, `TClient`\>(`schema`, `input`)

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
| `schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `input` | `TInput` |

#### Defined in

[src/abstract/QueryBase.ts:27](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L27)

## Properties

### RUNNER\_CLASS

• `Protected` `Readonly` `Abstract` **RUNNER\_CLASS**: `Object`

#### Call signature

• **new RUNNER_CLASS**(`schema`, `client`): [`Runner`](Runner.md)<`TInput`, `TOutput`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `client` | `TClient` |

##### Returns

[`Runner`](Runner.md)<`TInput`, `TOutput`\>

#### Type declaration

| Name | Type |
| :------ | :------ |
| `IS_WRITE` | `boolean` |

#### Defined in

[src/abstract/QueryBase.ts:22](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L22)

___

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

#### Defined in

[src/abstract/QueryBase.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L28)

___

### input

• `Readonly` **input**: `TInput`

#### Defined in

[src/abstract/QueryBase.ts:29](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L29)

## Accessors

### IS\_WRITE

• `get` **IS_WRITE**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[Query](../interfaces/Query.md).[IS_WRITE](../interfaces/Query.md#is_write)

#### Defined in

[src/abstract/QueryBase.ts:32](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L32)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`<`TOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `TClient` |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`<`TOutput`\>

#### Implementation of

[Query](../interfaces/Query.md).[run](../interfaces/Query.md#run)

#### Defined in

[src/abstract/QueryBase.ts:36](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L36)
