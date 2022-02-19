[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Query

# Interface: Query<TOutput\>

A very lean interface for a Query. In practice each query is so different
that this interface is the only common part of them all.

## Type parameters

| Name |
| :------ |
| `TOutput` |

## Implemented by

- [`QueryBase`](../classes/QueryBase.md)
- [`SQLQueryUpdate`](../classes/SQLQueryUpdate.md)

## Properties

### IS\_WRITE

• `Readonly` **IS\_WRITE**: `boolean`

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:12](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L12)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`<`TOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`Client`](../classes/Client.md) |
| `annotation` | [`QueryAnnotation`](QueryAnnotation.md) |

#### Returns

`Promise`<`TOutput`\>

#### Defined in

[packages/ent-framework/src/abstract/Query.ts:13](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Query.ts#L13)
