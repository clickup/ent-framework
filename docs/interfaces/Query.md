[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Query

# Interface: Query\<TOutput\>

A very lean interface for a Query. In practice each query is so different
that this interface is the only common part of them all.

## Type Parameters

| Type Parameter |
| ------ |
| `TOutput` |

## Properties

| Property | Type |
| ------ | ------ |
| `IS_WRITE` | `boolean` |

## Methods

### run()

> **run**(`client`, `annotation`): `Promise`\<`TOutput`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](../classes/Client.md) |
| `annotation` | [`QueryAnnotation`](QueryAnnotation.md) |

#### Returns

`Promise`\<`TOutput`\>

#### Defined in

[src/abstract/Query.ts:10](https://github.com/clickup/ent-framework/blob/master/src/abstract/Query.ts#L10)
