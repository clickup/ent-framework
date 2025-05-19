[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgQueryDeleteWhere

# Class: PgQueryDeleteWhere\<TTable\>

Defined in: [src/pg/PgQueryDeleteWhere.ts:10](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryDeleteWhere.ts#L10)

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

Defined in: [src/abstract/QueryBase.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L28)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `input` | [`DeleteWhereInput`](../type-aliases/DeleteWhereInput.md)\<`TTable`\> |

#### Returns

[`PgQueryDeleteWhere`](PgQueryDeleteWhere.md)\<`TTable`\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`constructor`](QueryBase.md#constructors)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="schema-1"></a> `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| <a id="input-1"></a> `input` | [`DeleteWhereInput`](../type-aliases/DeleteWhereInput.md)\<`TTable`\> |

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

> **run**(`client`, `annotation`): `Promise`\<`string`[]\>

Defined in: [src/abstract/QueryBase.ts:37](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L37)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`PgClient`](PgClient.md)\<`Pool`\> |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`string`[]\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`run`](QueryBase.md#run)
