[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Cluster

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
| `TNode` | [`DesperateAny`](../modules.md#desperateany) |

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

[src/abstract/Cluster.ts:121](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L121)

## Properties

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`<[`PickPartial`](../modules.md#pickpartial)<[`ClusterOptions`](../interfaces/ClusterOptions.md)<[`Client`](Client.md), `never`\>\>\>

Default values for the constructor options.

#### Defined in

[src/abstract/Cluster.ts:85](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L85)

___

### options

• `Readonly` **options**: `Required`<[`ClusterOptions`](../interfaces/ClusterOptions.md)<`TClient`, `TNode`\>\>

Cluster configuration options.

#### Defined in

[src/abstract/Cluster.ts:117](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L117)

___

### loggers

• `Readonly` **loggers**: [`Loggers`](../interfaces/Loggers.md)

Cluster logging handlers (derived from some node's Client).

#### Defined in

[src/abstract/Cluster.ts:119](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L119)

## Methods

### prewarm

▸ **prewarm**(): `void`

Signals the Cluster to keep the Clients pre-warmed, e.g. open. (It's up to
the particular Client's implementation, what does a "pre-warmed Client"
mean; typically, it's keeping some minimal number of pooled connections.)

#### Returns

`void`

#### Defined in

[src/abstract/Cluster.ts:177](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L177)

___

### globalShard

▸ **globalShard**(): [`Shard`](Shard.md)<`TClient`\>

Returns a global Shard of the Cluster. This method is made synchronous
intentionally, to defer the I/O and possible errors to the moment of the
actual query.

#### Returns

[`Shard`](Shard.md)<`TClient`\>

#### Defined in

[src/abstract/Cluster.ts:192](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L192)

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

[src/abstract/Cluster.ts:211](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L211)

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

[src/abstract/Cluster.ts:219](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L219)

___

### nonGlobalShards

▸ **nonGlobalShards**(): `Promise`<readonly [`Shard`](Shard.md)<`TClient`\>[]\>

Returns all currently known (discovered) non-global Shards in the Cluster.

#### Returns

`Promise`<readonly [`Shard`](Shard.md)<`TClient`\>[]\>

#### Defined in

[src/abstract/Cluster.ts:238](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L238)

___

### islands

▸ **islands**(): `Promise`<`number`[]\>

Returns all Island numbers in the Cluster.

#### Returns

`Promise`<`number`[]\>

#### Defined in

[src/abstract/Cluster.ts:246](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L246)

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

[src/abstract/Cluster.ts:254](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L254)

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

[src/abstract/Cluster.ts:266](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L266)

___

### rediscover

▸ **rediscover**(): `Promise`<`void`\>

Triggers shards rediscovery and finishes as soon as it's done. To be used
in unit tests mostly, because in real life, it's enough to just modify the
cluster configuration.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/abstract/Cluster.ts:283](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L283)
