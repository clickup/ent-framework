[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgQueryLoadBy

# Class: PgQueryLoadBy\<TTable, TUniqueKey\>

Defined in: [src/pg/PgQueryLoadBy.ts:8](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryLoadBy.ts#L8)

A convenient base class for most (but not all) of the queries, where the
Runner instance is the same for different query input shapes. If the query
doesn't fit the QueryBase framework (like PgQueryUpdate for instance where we
have separate Runner instances for separate set of updated fields), a Query
is used directly instead.

## Extends

- [`QueryBase`](QueryBase.md)\<`TTable`, [`LoadByInput`](../type-aliases/LoadByInput.md)\<`TTable`, `TUniqueKey`\>, [`Row`](../type-aliases/Row.md)\<`TTable`\> \| `null`, [`PgClient`](PgClient.md)\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> |

## Constructors

### new PgQueryLoadBy()

> **new PgQueryLoadBy**\<`TTable`, `TUniqueKey`\>(`schema`, `input`): [`PgQueryLoadBy`](PgQueryLoadBy.md)\<`TTable`, `TUniqueKey`\>

Defined in: [src/abstract/QueryBase.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L28)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `input` | [`LoadByInput`](../type-aliases/LoadByInput.md)\<`TTable`, `TUniqueKey`\> |

#### Returns

[`PgQueryLoadBy`](PgQueryLoadBy.md)\<`TTable`, `TUniqueKey`\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`constructor`](QueryBase.md#constructors)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="schema-1"></a> `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| <a id="input-1"></a> `input` | [`LoadByInput`](../type-aliases/LoadByInput.md)\<`TTable`, `TUniqueKey`\> |

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

> **run**(`client`, `annotation`): `Promise`\<`null` \| [`Row`](../type-aliases/Row.md)\<`TTable`\>\>

Defined in: [src/abstract/QueryBase.ts:37](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L37)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`PgClient`](PgClient.md)\<`Pool`\> |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`null` \| [`Row`](../type-aliases/Row.md)\<`TTable`\>\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`run`](QueryBase.md#run)
