[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgQueryUpdate

# Class: PgQueryUpdate\<TTable\>

A very lean interface for a Query. In practice each query is so different
that this interface is the only common part of them all.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Implements

- [`Query`](../interfaces/Query.md)\<`boolean`\>

## Constructors

### constructor

• **new PgQueryUpdate**\<`TTable`\>(`schema`, `id`, `input`): [`PgQueryUpdate`](PgQueryUpdate.md)\<`TTable`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\> |
| `id` | `string` |
| `input` | [`UpdateInput`](../modules.md#updateinput)\<`TTable`\> |

#### Returns

[`PgQueryUpdate`](PgQueryUpdate.md)\<`TTable`\>

#### Defined in

[src/pg/PgQueryUpdate.ts:16](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryUpdate.ts#L16)

## Properties

### input

• `Readonly` **input**: \{ [K in string \| number \| symbol]?: Value\<TTable[K]\> } & \{ `$literal?`: [`Literal`](../modules.md#literal) ; `$cas?`: \{ [K in string \| number \| symbol]?: Value\<TTable[K]\> }  } & \{ `id`: `string`  }

#### Defined in

[src/pg/PgQueryUpdate.ts:13](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryUpdate.ts#L13)

___

### IS\_WRITE

• `Readonly` **IS\_WRITE**: ``true``

#### Implementation of

[Query](../interfaces/Query.md).[IS_WRITE](../interfaces/Query.md#is_write)

#### Defined in

[src/pg/PgQueryUpdate.ts:14](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryUpdate.ts#L14)

___

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\>

#### Defined in

[src/pg/PgQueryUpdate.ts:17](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryUpdate.ts#L17)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`PgClient`](PgClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[Query](../interfaces/Query.md).[run](../interfaces/Query.md#run)

#### Defined in

[src/pg/PgQueryUpdate.ts:26](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryUpdate.ts#L26)
