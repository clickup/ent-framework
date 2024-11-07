[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / PgQueryUpsert

# Class: PgQueryUpsert\<TTable\>

A convenient base class for most (but not all) of the queries, where the
Runner instance is the same for different query input shapes. If the query
doesn't fit the QueryBase framework (like PgQueryUpdate for instance where we
have separate Runner instances for separate set of updated fields), a Query
is used directly instead.

## Extends

- [`QueryBase`](QueryBase.md)\<`TTable`, [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>, `string`, [`PgClient`](PgClient.md)\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Constructors

### new PgQueryUpsert()

> **new PgQueryUpsert**\<`TTable`\>(`schema`, `input`): [`PgQueryUpsert`](PgQueryUpsert.md)\<`TTable`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `input` | [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\> |

#### Returns

[`PgQueryUpsert`](PgQueryUpsert.md)\<`TTable`\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`constructor`](QueryBase.md#constructors)

#### Defined in

[src/abstract/QueryBase.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L28)

## Properties

| Property | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `input` | [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\> |

## Accessors

### IS\_WRITE

#### Get Signature

> **get** **IS\_WRITE**(): `boolean`

##### Returns

`boolean`

#### Inherited from

[`QueryBase`](QueryBase.md).[`IS_WRITE`](QueryBase.md#is_write)

#### Defined in

[src/abstract/QueryBase.ts:33](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L33)

## Methods

### run()

> **run**(`client`, `annotation`): `Promise`\<`string`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`PgClient`](PgClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`run`](QueryBase.md#run)

#### Defined in

[src/abstract/QueryBase.ts:37](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L37)
