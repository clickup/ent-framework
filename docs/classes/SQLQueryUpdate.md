[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SQLQueryUpdate

# Class: SQLQueryUpdate<TTable\>

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

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:14](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L14)

## Properties

### IS\_WRITE

• `Readonly` **IS\_WRITE**: ``true``

#### Implementation of

[Query](../interfaces/Query.md).[IS_WRITE](../interfaces/Query.md#is_write)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:12](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L12)

___

### input

• `Readonly` **input**: { [K in string \| number \| symbol]?: Value<TTable[K]\> } & { `$literal?`: [`Literal`](../modules.md#literal)  } & { `id`: `string`  }

#### Defined in

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:11](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L11)

___

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`SQLClient`](../interfaces/SQLClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`<`boolean`\>

#### Implementation of

[Query](../interfaces/Query.md).[run](../interfaces/Query.md#run)

#### Defined in

[packages/ent-framework/src/sql/SQLQueryUpdate.ts:23](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLQueryUpdate.ts#L23)
