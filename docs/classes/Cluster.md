[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Cluster

# Class: Cluster\<TClient, TNode\>

Cluster is a collection of Islands and an orchestration of shardNo -> Island
resolution.

It's unknown beforehand, which Island some particular Shard belongs to; the
resolution is done asynchronously and lazily.

Shard 0 is a special "global" Shard.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |
| `TNode` | `DesperateAny` |

## Constructors

### constructor

• **new Cluster**\<`TClient`, `TNode`\>(`options`): [`Cluster`](Cluster.md)\<`TClient`, `TNode`\>

Initializes the Cluster, but doesn't send any queries yet, even discovery
queries (also, no implicit prewarming).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |
| `TNode` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`ClusterOptions`](../interfaces/ClusterOptions.md)\<`TClient`, `TNode`\> |

#### Returns

[`Cluster`](Cluster.md)\<`TClient`, `TNode`\>

#### Defined in

[src/abstract/Cluster.ts:133](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L133)

## Properties

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`\<`PickPartial`\<[`ClusterOptions`](../interfaces/ClusterOptions.md)\<[`Client`](Client.md), `never`\>\>\>

Default values for the constructor options.

#### Defined in

[src/abstract/Cluster.ts:95](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L95)

___

### options

• `Readonly` **options**: `Required`\<[`ClusterOptions`](../interfaces/ClusterOptions.md)\<`TClient`, `TNode`\>\>

Cluster configuration options.

#### Defined in

[src/abstract/Cluster.ts:127](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L127)

## Methods

### prewarm

▸ **prewarm**(): `void`

Signals the Cluster to keep the Clients pre-warmed, e.g. open. (It's up to
the particular Client's implementation, what does a "pre-warmed Client"
mean; typically, it's keeping some minimal number of pooled connections.)

#### Returns

`void`

#### Defined in

[src/abstract/Cluster.ts:210](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L210)

___

### globalShard

▸ **globalShard**(): [`Shard`](Shard.md)\<`TClient`\>

Returns a global Shard of the Cluster. This method is made synchronous
intentionally, to defer the I/O and possible errors to the moment of the
actual query.

#### Returns

[`Shard`](Shard.md)\<`TClient`\>

#### Defined in

[src/abstract/Cluster.ts:226](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L226)

___

### nonGlobalShards

▸ **nonGlobalShards**(): `Promise`\<readonly [`Shard`](Shard.md)\<`TClient`\>[]\>

Returns all currently known (discovered) non-global Shards in the Cluster.

#### Returns

`Promise`\<readonly [`Shard`](Shard.md)\<`TClient`\>[]\>

#### Defined in

[src/abstract/Cluster.ts:233](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L233)

___

### shard

▸ **shard**(`id`): [`Shard`](Shard.md)\<`TClient`\>

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

[`Shard`](Shard.md)\<`TClient`\>

#### Defined in

[src/abstract/Cluster.ts:253](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L253)

___

### shardByNo

▸ **shardByNo**(`shardNo`): [`Shard`](Shard.md)\<`TClient`\>

Returns a Shard if we know its number. The idea: for each Shard number
(even for non-discovered yet Shards), we keep the corresponding Shard
object in a Memoize cache, so Shards with the same number always resolve
into the same Shard object. Then, an actual Island locating process happens
when the caller wants to get a Client of that Shard (and it throws if such
Shard hasn't been discovered actually).

#### Parameters

| Name | Type |
| :------ | :------ |
| `shardNo` | `number` |

#### Returns

[`Shard`](Shard.md)\<`TClient`\>

#### Defined in

[src/abstract/Cluster.ts:266](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L266)

___

### randomShard

▸ **randomShard**(`seed?`): `Promise`\<[`Shard`](Shard.md)\<`TClient`\>\>

Returns a random Shard among the ones which are currently known
(discovered) in the Cluster.

#### Parameters

| Name | Type |
| :------ | :------ |
| `seed?` | `object` |

#### Returns

`Promise`\<[`Shard`](Shard.md)\<`TClient`\>\>

#### Defined in

[src/abstract/Cluster.ts:276](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L276)

___

### island

▸ **island**(`islandNo`): `Promise`\<[`Island`](Island.md)\<`TClient`\>\>

Returns an Island by its number.

#### Parameters

| Name | Type |
| :------ | :------ |
| `islandNo` | `number` |

#### Returns

`Promise`\<[`Island`](Island.md)\<`TClient`\>\>

#### Defined in

[src/abstract/Cluster.ts:295](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L295)

___

### islands

▸ **islands**(): `Promise`\<[`Island`](Island.md)\<`TClient`\>[]\>

Returns all Islands in the Cluster.

#### Returns

`Promise`\<[`Island`](Island.md)\<`TClient`\>[]\>

#### Defined in

[src/abstract/Cluster.ts:306](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L306)

___

### rediscover

▸ **rediscover**(): `Promise`\<`void`\>

Triggers shards rediscovery and finishes as soon as it's done. To be used
in unit tests mostly, because in real life, it's enough to just modify the
cluster configuration.

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/abstract/Cluster.ts:316](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L316)
