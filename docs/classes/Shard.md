[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Shard

# Class: Shard<TClient\>

Shard is a numbered island with one master and N replicas.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

## Constructors

### constructor

• **new Shard**<`TClient`\>(`no`, `locateIsland`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md)<`TClient`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |
| `locateIsland` | () => `Promise`<[`Island`](Island.md)<`TClient`\>\> |

#### Defined in

[packages/ent-framework/src/abstract/Shard.ts:22](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Shard.ts#L22)

## Properties

### no

• `Readonly` **no**: `number`

## Methods

### client

▸ **client**(`timeline`): `Promise`<`TClient`\>

Chooses the right client to be used for this shard.

#### Parameters

| Name | Type |
| :------ | :------ |
| `timeline` | [`Timeline`](Timeline.md) \| typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica) |

#### Returns

`Promise`<`TClient`\>

#### Defined in

[packages/ent-framework/src/abstract/Shard.ts:30](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Shard.ts#L30)

___

### run

▸ **run**<`TOutput`\>(`query`, `annotation`, `timeline`, `freshness`): `Promise`<`TOutput`\>

Runs a query after choosing the right client (destination connection,
shard, annotation etc.)

#### Type parameters

| Name |
| :------ |
| `TOutput` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`Query`](../interfaces/Query.md)<`TOutput`\> |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |
| `timeline` | [`Timeline`](Timeline.md) |
| `freshness` | ``null`` \| typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica) |

#### Returns

`Promise`<`TOutput`\>

#### Defined in

[packages/ent-framework/src/abstract/Shard.ts:41](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Shard.ts#L41)
