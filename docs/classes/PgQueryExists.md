[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgQueryExists

# Class: PgQueryExists\<TTable\>

Defined in: [src/pg/PgQueryExists.ts:8](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryExists.ts#L8)

A convenient base class for most (but not all) of the queries, where the
Runner instance is the same for different query input shapes. If the query
doesn't fit the QueryBase framework (like PgQueryUpdate for instance where we
have separate Runner instances for separate set of updated fields), a Query
is used directly instead.

## Extends

- [`QueryBase`](QueryBase.md)\<`TTable`, [`ExistsInput`](../type-aliases/ExistsInput.md)\<`TTable`\>, `boolean`, [`PgClient`](PgClient.md)\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Constructors

### new PgQueryExists()

> **new PgQueryExists**\<`TTable`\>(`schema`, `input`): [`PgQueryExists`](PgQueryExists.md)\<`TTable`\>

Defined in: [src/abstract/QueryBase.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L28)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `input` | [`ExistsInput`](../type-aliases/ExistsInput.md)\<`TTable`\> |

#### Returns

[`PgQueryExists`](PgQueryExists.md)\<`TTable`\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`constructor`](QueryBase.md#constructors)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="schema-1"></a> `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| <a id="input-1"></a> `input` | [`ExistsInput`](../type-aliases/ExistsInput.md)\<`TTable`\> |

## Accessors

### IS\_WRITE

#### Get Signature

> **get** **IS\_WRITE**(): `boolean`

Defined in: [src/abstract/QueryBase.ts:33](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L33)

##### Returns

`boolean`

#### Inherited from

[`QueryBase`](QueryBase.md).[`IS_WRITE`](QueryBase.md#is_write)

## Methods

### run()

> **run**(`client`, `annotation`): `Promise`\<`boolean`\>

Defined in: [src/abstract/QueryBase.ts:37](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L37)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`PgClient`](PgClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`run`](QueryBase.md#run)
