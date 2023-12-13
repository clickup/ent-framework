[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Shard

# Class: Shard<TClient\>

Shard lives within an Island with one master and N replicas.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

## Constructors

### constructor

• **new Shard**<`TClient`\>(`no`, `options`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |
| `options` | [`ShardOptions`](../interfaces/ShardOptions.md)<`TClient`\> |

#### Defined in

[src/abstract/Shard.ts:32](https://github.com/clickup/rest-client/blob/master/src/abstract/Shard.ts#L32)

## Properties

### no

• `Readonly` **no**: `number`

#### Defined in

[src/abstract/Shard.ts:33](https://github.com/clickup/rest-client/blob/master/src/abstract/Shard.ts#L33)

___

### options

• `Readonly` **options**: [`ShardOptions`](../interfaces/ShardOptions.md)<`TClient`\>

#### Defined in

[src/abstract/Shard.ts:34](https://github.com/clickup/rest-client/blob/master/src/abstract/Shard.ts#L34)

## Methods

### client

▸ **client**(`timeline`): `Promise`<`TClient`\>

Chooses the right Client to be used for this Shard. We don't memoize,
because the Shard may relocate to another Island during re-discovery.

#### Parameters

| Name | Type |
| :------ | :------ |
| `timeline` | [`Timeline`](Timeline.md) \| typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica) |

#### Returns

`Promise`<`TClient`\>

#### Defined in

[src/abstract/Shard.ts:41](https://github.com/clickup/rest-client/blob/master/src/abstract/Shard.ts#L41)

___

### run

▸ **run**<`TOutput`\>(`query`, `annotation`, `timeline`, `freshness`): `Promise`<`TOutput`\>

Runs a query after choosing the right Client (destination connection,
Shard, annotation etc.)

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

[src/abstract/Shard.ts:62](https://github.com/clickup/rest-client/blob/master/src/abstract/Shard.ts#L62)

___

### assertDiscoverable

▸ **assertDiscoverable**(): `Promise`<`void`\>

Throws if this Shard does not exist, or its Island is down, or something
else is wrong with it.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/abstract/Shard.ts:107](https://github.com/clickup/rest-client/blob/master/src/abstract/Shard.ts#L107)
