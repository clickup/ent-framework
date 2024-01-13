[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Query

# Interface: Query\<TOutput\>

A very lean interface for a Query. In practice each query is so different
that this interface is the only common part of them all.

## Type parameters

| Name |
| :------ |
| `TOutput` |

## Implemented by

- [`PgQuerySelectBy`](../classes/PgQuerySelectBy.md)
- [`PgQueryUpdate`](../classes/PgQueryUpdate.md)
- [`QueryBase`](../classes/QueryBase.md)

## Properties

### IS\_WRITE

• `Readonly` **IS\_WRITE**: `boolean`

#### Defined in

[src/abstract/Query.ts:9](https://github.com/clickup/ent-framework/blob/master/src/abstract/Query.ts#L9)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`\<`TOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`Client`](../classes/Client.md) |
| `annotation` | [`QueryAnnotation`](QueryAnnotation.md) |

#### Returns

`Promise`\<`TOutput`\>

#### Defined in

[src/abstract/Query.ts:10](https://github.com/clickup/ent-framework/blob/master/src/abstract/Query.ts#L10)
