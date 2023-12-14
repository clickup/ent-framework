[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Cluster

# Class: Cluster<TClient, TNode\>

Cluster is a collection of Islands and an orchestration of shardNo -> Island
resolution.

It's unknown beforehand, which Island some particular Shard belongs to; the
resolution is done asynchronously and lazily.

Shard 0 is a special "global" Shard.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |
| `TNode` | `any` |

## Constructors

### constructor

• **new Cluster**<`TClient`, `TNode`\>(`options`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |
| `TNode` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`ClusterOptions`](../interfaces/ClusterOptions.md)<`TClient`, `TNode`\> |

#### Defined in

[src/abstract/Cluster.ts:95](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L95)

## Properties

### options

• `Readonly` **options**: `Required`<[`ClusterOptions`](../interfaces/ClusterOptions.md)<`TClient`, `TNode`\>\>

#### Defined in

[src/abstract/Cluster.ts:92](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L92)

___

### loggers

• `Readonly` **loggers**: [`Loggers`](../interfaces/Loggers.md)

#### Defined in

[src/abstract/Cluster.ts:93](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L93)

## Methods

### prewarm

▸ **prewarm**(): `void`

If called once, keeps the Clients pre-warmed, e.g. open. (It's up to the
particular Client's implementation, what does a "pre-warmed Client" mean.)

#### Returns

`void`

#### Defined in

[src/abstract/Cluster.ts:133](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L133)

___

### globalShard

▸ **globalShard**(): [`Shard`](Shard.md)<`TClient`\>

Returns a global Shard of the Cluster. This method is made synchronous
intentionally, to defer the I/O and possible errors to the moment of the
actual query.

#### Returns

[`Shard`](Shard.md)<`TClient`\>

#### Defined in

[src/abstract/Cluster.ts:147](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L147)

___

### shard

▸ **shard**(`id`): [`Shard`](Shard.md)<`TClient`\>

Returns Shard of a particular id. This method is made synchronous
intentionally, to defer the I/O and possible errors to the moment of the
actual query.

Why is it important? Because Shards may go up and down temporarily at
random moments of time. Imagine we made this method async and asserted that
the Shard is actually available at the moment when the method is called.
What would happen if the Shard object was stored somewhere as "successful"
by the caller, then the Island went down, and then a query is sent to the
Shard in, say, 20 seconds? We'd get an absolutely different exception, at
the moment of the query. We don't want this to happen: we want all of the
exceptions to be thrown with a consistent call stack (e.g. at the moment of
the query), no matter whether it was an immediate call or a deferred one.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`Shard`](Shard.md)<`TClient`\>

#### Defined in

[src/abstract/Cluster.ts:166](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L166)

___

### randomShard

▸ **randomShard**(`seed?`): `Promise`<[`Shard`](Shard.md)<`TClient`\>\>

Returns a random Shard among the ones which are currently known
(discovered) in the Cluster.

#### Parameters

| Name | Type |
| :------ | :------ |
| `seed?` | `object` |

#### Returns

`Promise`<[`Shard`](Shard.md)<`TClient`\>\>

#### Defined in

[src/abstract/Cluster.ts:175](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L175)

___

### nonGlobalShards

▸ **nonGlobalShards**(): `Promise`<readonly [`Shard`](Shard.md)<`TClient`\>[]\>

Returns all currently known (discovered) non-global Shards in the Cluster.

#### Returns

`Promise`<readonly [`Shard`](Shard.md)<`TClient`\>[]\>

#### Defined in

[src/abstract/Cluster.ts:194](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L194)

___

### islands

▸ **islands**(): `number`[]

Returns all Island numbers in the Cluster.

#### Returns

`number`[]

#### Defined in

[src/abstract/Cluster.ts:202](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L202)

___

### islandShards

▸ **islandShards**(`islandNo`): `Promise`<[`Shard`](Shard.md)<`TClient`\>[]\>

Returns all currently known (discovered) Shards of a particular Island.

#### Parameters

| Name | Type |
| :------ | :------ |
| `islandNo` | `number` |

#### Returns

`Promise`<[`Shard`](Shard.md)<`TClient`\>[]\>

#### Defined in

[src/abstract/Cluster.ts:209](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L209)

___

### islandClient

▸ **islandClient**(`islandNo`, `freshness`): `Promise`<`TClient`\>

Returns a Client of a particular Island.

#### Parameters

| Name | Type |
| :------ | :------ |
| `islandNo` | `number` |
| `freshness` | typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica) |

#### Returns

`Promise`<`TClient`\>

#### Defined in

[src/abstract/Cluster.ts:221](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L221)
