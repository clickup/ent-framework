[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgQueryInsert

# Class: PgQueryInsert\<TTable\>

A convenient base class for most (but not all) of the queries, where the
Runner instance is the same for different query input shapes. If the query
doesn't fit the QueryBase framework (like PgQueryUpdate for instance where we
have separate Runner instances for separate set of updated fields), a Query
is used directly instead.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Hierarchy

- [`QueryBase`](QueryBase.md)\<`TTable`, [`InsertInput`](../modules.md#insertinput)\<`TTable`\>, `string` \| ``null``, [`PgClient`](PgClient.md)\>

  ↳ **`PgQueryInsert`**

## Constructors

### constructor

• **new PgQueryInsert**\<`TTable`\>(`schema`, `input`): [`PgQueryInsert`](PgQueryInsert.md)\<`TTable`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\> |
| `input` | [`InsertInput`](../modules.md#insertinput)\<`TTable`\> |

#### Returns

[`PgQueryInsert`](PgQueryInsert.md)\<`TTable`\>

#### Inherited from

[QueryBase](QueryBase.md).[constructor](QueryBase.md#constructor)

#### Defined in

[src/abstract/QueryBase.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L28)

## Properties

### schema

• `Readonly` **schema**: [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\>

#### Inherited from

[QueryBase](QueryBase.md).[schema](QueryBase.md#schema)

#### Defined in

[src/abstract/QueryBase.ts:29](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L29)

___

### input

• `Readonly` **input**: [`InsertInput`](../modules.md#insertinput)\<`TTable`\>

#### Inherited from

[QueryBase](QueryBase.md).[input](QueryBase.md#input)

#### Defined in

[src/abstract/QueryBase.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L30)

## Accessors

### IS\_WRITE

• `get` **IS_WRITE**(): `boolean`

#### Returns

`boolean`

#### Inherited from

QueryBase.IS\_WRITE

#### Defined in

[src/abstract/QueryBase.ts:33](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L33)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`\<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`PgClient`](PgClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<``null`` \| `string`\>

#### Inherited from

[QueryBase](QueryBase.md).[run](QueryBase.md#run)

#### Defined in

[src/abstract/QueryBase.ts:37](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L37)
