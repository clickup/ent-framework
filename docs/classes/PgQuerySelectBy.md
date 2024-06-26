[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgQuerySelectBy

# Class: PgQuerySelectBy\<TTable, TUniqueKey\>

A very lean interface for a Query. In practice each query is so different
that this interface is the only common part of them all.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\> |

## Implements

- [`Query`](../interfaces/Query.md)\<[`Row`](../modules.md#row)\<`TTable`\>[]\>

## Constructors

### constructor

• **new PgQuerySelectBy**\<`TTable`, `TUniqueKey`\>(`schema`, `input`): [`PgQuerySelectBy`](PgQuerySelectBy.md)\<`TTable`, `TUniqueKey`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\> |
| `input` | [`SelectByInput`](../modules.md#selectbyinput)\<`TTable`, `TUniqueKey`\> |

#### Returns

[`PgQuerySelectBy`](PgQuerySelectBy.md)\<`TTable`, `TUniqueKey`\>

#### Defined in

[src/pg/PgQuerySelectBy.ts:21](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelectBy.ts#L21)

## Properties

### IS\_WRITE

• `Readonly` **IS\_WRITE**: ``false``

#### Implementation of

[Query](../interfaces/Query.md).[IS_WRITE](../interfaces/Query.md#is_write)

#### Defined in

[src/pg/PgQuerySelectBy.ts:19](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelectBy.ts#L19)

___

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\>

#### Defined in

[src/pg/PgQuerySelectBy.ts:22](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelectBy.ts#L22)

___

### input

• `Readonly` **input**: [`LoadByInput`](../modules.md#loadbyinput)\<`TTable`, `TuplePrefixes`\<`TUniqueKey`\>\>

#### Defined in

[src/pg/PgQuerySelectBy.ts:23](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelectBy.ts#L23)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`\<[`Row`](../modules.md#row)\<`TTable`\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`PgClient`](PgClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<[`Row`](../modules.md#row)\<`TTable`\>[]\>

#### Implementation of

[Query](../interfaces/Query.md).[run](../interfaces/Query.md#run)

#### Defined in

[src/pg/PgQuerySelectBy.ts:26](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelectBy.ts#L26)
