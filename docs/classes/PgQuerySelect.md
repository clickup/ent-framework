[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgQuerySelect

# Class: PgQuerySelect\<TTable\>

Defined in: [src/pg/PgQuerySelect.ts:35](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelect.ts#L35)

A convenient base class for most (but not all) of the queries, where the
Runner instance is the same for different query input shapes. If the query
doesn't fit the QueryBase framework (like PgQueryUpdate for instance where we
have separate Runner instances for separate set of updated fields), a Query
is used directly instead.

## Extends

- [`QueryBase`](QueryBase.md)\<`TTable`, [`SelectInput`](../type-aliases/SelectInput.md)\<`TTable`\>, [`Row`](../type-aliases/Row.md)\<`TTable`\>[], [`PgClient`](PgClient.md)\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Constructors

### new PgQuerySelect()

> **new PgQuerySelect**\<`TTable`\>(`schema`, `input`): [`PgQuerySelect`](PgQuerySelect.md)\<`TTable`\>

Defined in: [src/abstract/QueryBase.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryBase.ts#L28)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `input` | [`SelectInput`](../type-aliases/SelectInput.md)\<`TTable`\> |

#### Returns

[`PgQuerySelect`](PgQuerySelect.md)\<`TTable`\>

#### Inherited from

[`QueryBase`](QueryBase.md).[`constructor`](QueryBase.md#constructors)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="schema-1"></a> `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| <a id="input-1"></a> `input` | [`SelectInput`](../type-aliases/SelectInput.md)\<`TTable`\> |

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

> **run**(`client`, `annotation`): `Promise`\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

Defined in: [src/pg/PgQuerySelect.ts:44](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelect.ts#L44)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`PgClient`](PgClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

#### Overrides

[`QueryBase`](QueryBase.md).[`run`](QueryBase.md#run)
