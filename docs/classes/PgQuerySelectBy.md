[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgQuerySelectBy

# Class: PgQuerySelectBy\<TTable, TUniqueKey\>

Defined in: [src/pg/PgQuerySelectBy.ts:14](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelectBy.ts#L14)

A very lean interface for a Query. In practice each query is so different
that this interface is the only common part of them all.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> |

## Implements

- [`Query`](../interfaces/Query.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

## Constructors

### new PgQuerySelectBy()

> **new PgQuerySelectBy**\<`TTable`, `TUniqueKey`\>(`schema`, `input`): [`PgQuerySelectBy`](PgQuerySelectBy.md)\<`TTable`, `TUniqueKey`\>

Defined in: [src/pg/PgQuerySelectBy.ts:21](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelectBy.ts#L21)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `input` | [`SelectByInput`](../type-aliases/SelectByInput.md)\<`TTable`, `TUniqueKey`\> |

#### Returns

[`PgQuerySelectBy`](PgQuerySelectBy.md)\<`TTable`, `TUniqueKey`\>

## Properties

| Property | Type | Default value |
| ------ | ------ | ------ |
| <a id="is_write"></a> `IS_WRITE` | `false` | `false` |
| <a id="schema-1"></a> `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> | `undefined` |
| <a id="input-1"></a> `input` | [`LoadByInput`](../type-aliases/LoadByInput.md)\<`TTable`, `TuplePrefixes`\<`TUniqueKey`\>\> | `undefined` |

## Methods

### run()

> **run**(`client`, `annotation`): `Promise`\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

Defined in: [src/pg/PgQuerySelectBy.ts:26](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelectBy.ts#L26)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`PgClient`](PgClient.md)\<`Pool`\> |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<[`Row`](../type-aliases/Row.md)\<`TTable`\>[]\>

#### Implementation of

[`Query`](../interfaces/Query.md).[`run`](../interfaces/Query.md#run)
