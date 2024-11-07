[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / QueryPing

# Class: QueryPing

A helper Query which delegates to Client#ping(execTimeMs).

## Implements

- [`Query`](../interfaces/Query.md)\<`void`\>

## Constructors

### new QueryPing()

> **new QueryPing**(`input`): [`QueryPing`](QueryPing.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `Omit`\<[`ClientPingInput`](../interfaces/ClientPingInput.md), `"annotation"`\> |

#### Returns

[`QueryPing`](QueryPing.md)

#### Defined in

[src/abstract/QueryPing.ts:9](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L9)

## Properties

| Property | Type |
| ------ | ------ |
| `input` | `Omit`\<[`ClientPingInput`](../interfaces/ClientPingInput.md), `"annotation"`\> |

## Accessors

### IS\_WRITE

#### Get Signature

> **get** **IS\_WRITE**(): `boolean`

##### Returns

`boolean`

#### Implementation of

[`Query`](../interfaces/Query.md).`IS_WRITE`

#### Defined in

[src/abstract/QueryPing.ts:11](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L11)

## Methods

### run()

> **run**(`client`, `annotation`): `Promise`\<`void`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Query`](../interfaces/Query.md).[`run`](../interfaces/Query.md#run)

#### Defined in

[src/abstract/QueryPing.ts:15](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L15)
