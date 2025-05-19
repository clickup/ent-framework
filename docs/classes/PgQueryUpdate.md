[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgQueryUpdate

# Class: PgQueryUpdate\<TTable\>

Defined in: [src/pg/PgQueryUpdate.ts:11](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryUpdate.ts#L11)

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

Defined in: [src/pg/PgQueryUpdate.ts:16](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryUpdate.ts#L16)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `id` | `string` |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> |

#### Returns

[`PgQueryUpdate`](PgQueryUpdate.md)\<`TTable`\>

## Properties

| Property | Type | Default value |
| ------ | ------ | ------ |
| <a id="input-1"></a> `input` | \{ \[K in string \| number \| symbol\]?: Value\<TTable\[K\]\> \} & `object` & `object` | `undefined` |
| <a id="is_write"></a> `IS_WRITE` | `true` | `true` |
| <a id="schema-1"></a> `schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> | `undefined` |

## Methods

### run()

> **run**(`client`, `annotation`): `Promise`\<`boolean`\>

Defined in: [src/pg/PgQueryUpdate.ts:26](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQueryUpdate.ts#L26)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`PgClient`](PgClient.md)\<`Pool`\> |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Query`](../interfaces/Query.md).[`run`](../interfaces/Query.md#run)
