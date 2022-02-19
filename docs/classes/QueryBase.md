[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / QueryBase

# Class: QueryBase<TTable, TInput, TOutput, TClient\>

A convenient base class for most (but not all) of the queries. If the query
doesn't fit the QueryBase framework (like SQLQueryUpdate for instance), a
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
| `TClient` | extends [`Client`](Client.md)<`TClient`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `input` | `TInput` |

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:28](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L28)

## Properties

### RUNNER\_CLASS

• `Protected` `Readonly` `Abstract` **RUNNER\_CLASS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `IS_WRITE` | `boolean` |

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:33](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L33)

___

### input

• `Readonly` **input**: `TInput`

___

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

## Accessors

### IS\_WRITE

• `get` **IS_WRITE**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[Query](../interfaces/Query.md).[IS_WRITE](../interfaces/Query.md#is_write)

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:38](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L38)

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

[packages/ent-framework/src/abstract/Query.ts:42](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L42)
