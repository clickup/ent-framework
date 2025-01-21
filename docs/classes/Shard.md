[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Shard

# Class: Shard\<TClient\>

Defined in: [src/abstract/Shard.ts:21](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L21)

Shard lives within an Island with one master and N replicas.

## Type Parameters

| Type Parameter |
| ------ |
| `TClient` *extends* [`Client`](Client.md) |

## Constructors

### new Shard()

> **new Shard**\<`TClient`\>(`no`, `runWithLocatedIsland`): [`Shard`](Shard.md)\<`TClient`\>

Defined in: [src/abstract/Shard.ts:29](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L29)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `no` | `number` | Shard number. |
| `runWithLocatedIsland` | \<`TRes`\>(`body`) => `Promise`\<`TRes`\> | A middleware to wrap queries with. It's responsible for locating the right Island and retrying the call to body() (i.e. failed queries) in case e.g. a shard is moved to another Island. |

#### Returns

[`Shard`](Shard.md)\<`TClient`\>

## Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="lastknownislandno"></a> `lastKnownIslandNo` | `null` \| `number` | `null` | The last known Island number where this Shard was discovered. It may be out of date after the Shard is moved, and also it may be null in case there was no discovery happened yet. |
| <a id="no-1"></a> `no` | `number` | `undefined` | Shard number. |
| <a id="runwithlocatedisland-1"></a> `runWithLocatedIsland` | \<`TRes`\>(`body`: (`island`, `attempt`) => `Promise`\<`TRes`\>) => `Promise`\<`TRes`\> | `undefined` | A middleware to wrap queries with. It's responsible for locating the right Island and retrying the call to body() (i.e. failed queries) in case e.g. a shard is moved to another Island. |

## Methods

### client()

> **client**(`timeline`): `Promise`\<`TClient`\>

Defined in: [src/abstract/Shard.ts:44](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L44)

Chooses the right Client to be used for this Shard. We don't memoize,
because the Shard may relocate to another Island during re-discovery.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `timeline` | [`Timeline`](Timeline.md) \| *typeof* [`MASTER`](../variables/MASTER.md) \| *typeof* [`STALE_REPLICA`](../variables/STALE_REPLICA.md) |

#### Returns

`Promise`\<`TClient`\>

***

### run()

> **run**\<`TOutput`\>(`query`, `annotation`, `timeline`, `freshness`): `Promise`\<`TOutput`\>

Defined in: [src/abstract/Shard.ts:57](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L57)

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

***

### assertDiscoverable()

> **assertDiscoverable**(): `Promise`\<`void`\>

Defined in: [src/abstract/Shard.ts:94](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L94)

Throws if this Shard does not exist, or its Island is down, or something
else is wrong with it.

#### Returns

`Promise`\<`void`\>
