[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / QueryPing

# Class: QueryPing

A helper Query which delegates to Client#ping(execTimeMs).

## Implements

- [`Query`](../interfaces/Query.md)\<`void`\>

## Constructors

### constructor

• **new QueryPing**(`input`): [`QueryPing`](QueryPing.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `Omit`\<[`ClientPingInput`](../interfaces/ClientPingInput.md), ``"annotation"``\> |

#### Returns

[`QueryPing`](QueryPing.md)

#### Defined in

[src/abstract/QueryPing.ts:9](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L9)

## Properties

### input

• `Readonly` **input**: `Omit`\<[`ClientPingInput`](../interfaces/ClientPingInput.md), ``"annotation"``\>

#### Defined in

[src/abstract/QueryPing.ts:9](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L9)

## Accessors

### IS\_WRITE

• `get` **IS_WRITE**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[Query](../interfaces/Query.md).[IS_WRITE](../interfaces/Query.md#is_write)

#### Defined in

[src/abstract/QueryPing.ts:11](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L11)

## Methods

### run

▸ **run**(`client`, `annotation`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`Client`](Client.md) |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`void`\>

#### Implementation of

[Query](../interfaces/Query.md).[run](../interfaces/Query.md#run)

#### Defined in

[src/abstract/QueryPing.ts:15](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryPing.ts#L15)
