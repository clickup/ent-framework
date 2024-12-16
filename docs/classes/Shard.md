[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Shard

# Class: Shard\<TClient\>

Shard lives within an Island with one master and N replicas.

## Type Parameters

| Type Parameter |
| ------ |
| `TClient` *extends* [`Client`](Client.md) |

## Constructors

### new Shard()

> **new Shard**\<`TClient`\>(`no`, `runWithLocatedIsland`): [`Shard`](Shard.md)\<`TClient`\>

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `no` | `number` | Shard number. |
| `runWithLocatedIsland` | \<`TRes`\>(`body`) => `Promise`\<`TRes`\> | A middleware to wrap queries with. It's responsible for locating the right Island and retrying the call to body() (i.e. failed queries) in case e.g. a shard is moved to another Island. |

#### Returns

[`Shard`](Shard.md)\<`TClient`\>

#### Defined in

[src/abstract/Shard.ts:24](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L24)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `no` | `number` | Shard number. |
| `runWithLocatedIsland` | \<`TRes`\>(`body`: (`island`, `attempt`) => `Promise`\<`TRes`\>) => `Promise`\<`TRes`\> | A middleware to wrap queries with. It's responsible for locating the right Island and retrying the call to body() (i.e. failed queries) in case e.g. a shard is moved to another Island. |

## Methods

### client()

> **client**(`timeline`): `Promise`\<`TClient`\>

Chooses the right Client to be used for this Shard. We don't memoize,
because the Shard may relocate to another Island during re-discovery.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `timeline` | [`Timeline`](Timeline.md) \| *typeof* [`MASTER`](../variables/MASTER.md) \| *typeof* [`STALE_REPLICA`](../variables/STALE_REPLICA.md) |

#### Returns

`Promise`\<`TClient`\>

#### Defined in

[src/abstract/Shard.ts:39](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L39)

***

### run()

> **run**\<`TOutput`\>(`query`, `annotation`, `timeline`, `freshness`): `Promise`\<`TOutput`\>

Runs a query after choosing the right Client (destination connection,
Shard, annotation etc.)

#### Type Parameters

| Type Parameter |
| ------ |
| `TOutput` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `query` | [`Query`](../interfaces/Query.md)\<`TOutput`\> |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |
| `timeline` | [`Timeline`](Timeline.md) |
| `freshness` | `null` \| *typeof* [`MASTER`](../variables/MASTER.md) \| *typeof* [`STALE_REPLICA`](../variables/STALE_REPLICA.md) |

#### Returns

`Promise`\<`TOutput`\>

#### Defined in

[src/abstract/Shard.ts:52](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L52)

***

### assertDiscoverable()

> **assertDiscoverable**(): `Promise`\<`void`\>

Throws if this Shard does not exist, or its Island is down, or something
else is wrong with it.

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/abstract/Shard.ts:89](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L89)
