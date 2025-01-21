[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / QueryPing

# Class: QueryPing

Defined in: [src/abstract/QueryPing.ts:8](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L8)

A helper Query which delegates to Client#ping(execTimeMs).

## Implements

- [`Query`](../interfaces/Query.md)\<`void`\>

## Constructors

### new QueryPing()

> **new QueryPing**(`input`): [`QueryPing`](QueryPing.md)

Defined in: [src/abstract/QueryPing.ts:9](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L9)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `Omit`\<[`ClientPingInput`](../interfaces/ClientPingInput.md), `"annotation"`\> |

#### Returns

[`QueryPing`](QueryPing.md)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="input-1"></a> `input` | `Omit`\<[`ClientPingInput`](../interfaces/ClientPingInput.md), `"annotation"`\> |

## Accessors

### IS\_WRITE

#### Get Signature

> **get** **IS\_WRITE**(): `boolean`

Defined in: [src/abstract/QueryPing.ts:11](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L11)

##### Returns

`boolean`

#### Implementation of

[`Query`](../interfaces/Query.md).[`IS_WRITE`](../interfaces/Query.md#is_write)

## Methods

### run()

> **run**(`client`, `annotation`): `Promise`\<`void`\>

Defined in: [src/abstract/QueryPing.ts:15](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L15)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Query`](../interfaces/Query.md).[`run`](../interfaces/Query.md#run)
