[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLQueryUpdate

# Class: SQLQueryUpdate<TTable\>

A very lean interface for a Query. In practice each query is so different
that this interface is the only common part of them all.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Implements

- [`Query`](../interfaces/Query.md)<`boolean`\>

## Constructors

### constructor

• **new SQLQueryUpdate**<`TTable`\>(`schema`, `id`, `input`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `id` | `string` |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Defined in

[src/sql/SQLQueryUpdate.ts:16](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L16)

## Properties

### input

• `Readonly` **input**: { [K in string \| number \| symbol]?: Value<TTable[K]\> } & { `$literal?`: [`Literal`](../modules.md#literal) ; `$cas?`: { [K in string \| number \| symbol]?: Value<TTable[K]\> }  } & { `id`: `string`  }

#### Defined in

[src/sql/SQLQueryUpdate.ts:13](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L13)

___

### IS\_WRITE

• `Readonly` **IS\_WRITE**: ``true``

#### Implementation of

[Query](../interfaces/Query.md).[IS_WRITE](../interfaces/Query.md#is_write)

#### Defined in

[src/sql/SQLQueryUpdate.ts:14](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L14)

___

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

#### Defined in

[src/sql/SQLQueryUpdate.ts:17](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L17)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`SQLClient`](SQLClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`<`boolean`\>

#### Implementation of

[Query](../interfaces/Query.md).[run](../interfaces/Query.md#run)

#### Defined in

[src/sql/SQLQueryUpdate.ts:25](https://github.com/clickup/rest-client/blob/master/src/sql/SQLQueryUpdate.ts#L25)
