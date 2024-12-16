[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgQueryUpdate

# Class: PgQueryUpdate\<TTable\>

A very lean interface for a Query. In practice each query is so different
that this interface is the only common part of them all.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Implements

- [`Query`](../interfaces/Query.md)\<`boolean`\>

## Constructors

### new PgQueryUpdate()

> **new PgQueryUpdate**\<`TTable`\>(`schema`, `id`, `input`): [`PgQueryUpdate`](PgQueryUpdate.md)\<`TTable`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `id` | `string` |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> |

#### Returns

[`PgQueryUpdate`](PgQueryUpdate.md)\<`TTable`\>

#### Defined in

[src/pg/PgQueryUpdate.ts:16](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryUpdate.ts#L16)

## Properties

| Property | Type | Default value |
| ------ | ------ | ------ |
| `input` | \{ \[K in string \| number \| symbol\]?: Value\<TTable\[K\]\> \} & `object` & `object` | `undefined` |
| `IS_WRITE` | `true` | `true` |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> | `undefined` |

## Methods

### run()

> **run**(`client`, `annotation`): `Promise`\<`boolean`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`PgClient`](PgClient.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Query`](../interfaces/Query.md).[`run`](../interfaces/Query.md#run)

#### Defined in

[src/pg/PgQueryUpdate.ts:26](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryUpdate.ts#L26)
