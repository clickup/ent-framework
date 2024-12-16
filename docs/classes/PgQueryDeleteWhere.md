[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgQueryDeleteWhere

# Class: PgQueryDeleteWhere\<TTable\>

A convenient base class for most (but not all) of the queries, where the
Runner instance is the same for different query input shapes. If the query
doesn't fit the QueryBase framework (like PgQueryUpdate for instance where we
have separate Runner instances for separate set of updated fields), a Query
is used directly instead.

## Extends

- [`QueryBase`](QueryBase.md)\<`TTable`, [`DeleteWhereInput`](../type-aliases/DeleteWhereInput.md)\<`TTable`\>, `string`[], [`PgClient`](PgClient.md)\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Constructors

### new PgQueryDeleteWhere()

> **new PgQueryDeleteWhere**\<`TTable`\>(`schema`, `input`): [`PgQueryDeleteWhere`](PgQueryDeleteWhere.md)\<`TTable`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `input` | [`DeleteWhereInput`](../type-aliases/DeleteWhereInput.md)\<`TTable`\> |

#### Returns

[`PgQueryDeleteWhere`](PgQueryDeleteWhere.md)\<`TTable`\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`constructor`](QueryBase.md#constructors)

#### Defined in

[src/abstract/QueryBase.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L28)

## Properties

| Property | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `input` | [`DeleteWhereInput`](../type-aliases/DeleteWhereInput.md)\<`TTable`\> |

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

> **run**(`client`, `annotation`): `Promise`\<`string`[]\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`PgClient`](PgClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`string`[]\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`run`](QueryBase.md#run)

#### Defined in

[src/abstract/QueryBase.ts:37](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L37)
