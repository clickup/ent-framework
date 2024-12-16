[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Cluster

# Class: Cluster\<TClient, TNode\>

Cluster is a collection of Islands and an orchestration of shardNo -> Island
resolution.

It's unknown beforehand, which Island some particular Shard belongs to; the
resolution is done asynchronously and lazily.

Shard 0 is a special "global" Shard.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TClient` *extends* [`Client`](Client.md) | - |
| `TNode` | `DesperateAny` |

## Constructors

### new Cluster()

> **new Cluster**\<`TClient`, `TNode`\>(`options`): [`Cluster`](Cluster.md)\<`TClient`, `TNode`\>

Initializes the Cluster, but doesn't send any queries yet, even discovery
queries (also, no implicit prewarming).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ClusterOptions`](../interfaces/ClusterOptions.md)\<`TClient`, `TNode`\> |

#### Returns

[`Cluster`](Cluster.md)\<`TClient`, `TNode`\>

#### Defined in

[src/abstract/Cluster.ts:137](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L137)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`ClusterOptions`](../interfaces/ClusterOptions.md)\<[`Client`](Client.md), `never`\>\>\> | Default values for the constructor options. |
| `options` | `Required`\<[`ClusterOptions`](../interfaces/ClusterOptions.md)\<`TClient`, `TNode`\>\> | Cluster configuration options. |

## Methods

### prewarm()

> **prewarm**(`randomizedDelayMs`, `onInitialPrewarm`?): `void`

Signals the Cluster to keep the Clients pre-warmed, e.g. open. (It's up to
the particular Client's implementation, what does a "pre-warmed Client"
mean; typically, it's keeping some minimal number of pooled connections.)

Except when `randomizedDelayMs` is passed as 0, the actual prewarm (and
Islands discovery) queries will run with a randomized delay between N/2 and
N ms. It is better to operate in such mode: if multiple Node processes
start simultaneously in the cluster, then the randomization helps to avoid
new connections burst (new connections establishment is expensive for e.g.
pgbouncer or when DB is accessed over SSL).

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `randomizedDelayMs` | `number` | `5000` |
| `onInitialPrewarm`? | (`delayMs`) => `void` | `undefined` |

#### Returns

`void`

#### Defined in

[src/abstract/Cluster.ts:225](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L225)

***

### globalShard()

> **globalShard**(): [`Shard`](Shard.md)\<`TClient`\>

Returns a global Shard of the Cluster. This method is made synchronous
intentionally, to defer the I/O and possible errors to the moment of the
actual query.

#### Returns

[`Shard`](Shard.md)\<`TClient`\>

#### Defined in

[src/abstract/Cluster.ts:256](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L256)

***

### nonGlobalShards()

> **nonGlobalShards**(): `Promise`\<readonly [`Shard`](Shard.md)\<`TClient`\>[]\>

Returns all currently known (discovered) non-global Shards in the Cluster.

#### Returns

`Promise`\<readonly [`Shard`](Shard.md)\<`TClient`\>[]\>

#### Defined in

[src/abstract/Cluster.ts:263](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L263)

***

### shard()

> **shard**(`id`): [`Shard`](Shard.md)\<`TClient`\>

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

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

[`Shard`](Shard.md)\<`TClient`\>

#### Defined in

[src/abstract/Cluster.ts:283](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L283)

***

### shardByNo()

> **shardByNo**(`shardNo`): [`Shard`](Shard.md)\<`TClient`\>

Returns a Shard if we know its number. The idea: for each Shard number
(even for non-discovered yet Shards), we keep the corresponding Shard
object in a Memoize cache, so Shards with the same number always resolve
into the same Shard object. Then, an actual Island locating process happens
when the caller wants to get a Client of that Shard (and it throws if such
Shard hasn't been discovered actually).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `shardNo` | `number` |

#### Returns

[`Shard`](Shard.md)\<`TClient`\>

#### Defined in

[src/abstract/Cluster.ts:296](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L296)

***

### randomShard()

> **randomShard**(`seed`?): `Promise`\<[`Shard`](Shard.md)\<`TClient`\>\>

Returns a random Shard among the ones which are currently known
(discovered) in the Cluster.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `seed`? | `object` |

#### Returns

`Promise`\<[`Shard`](Shard.md)\<`TClient`\>\>

#### Defined in

[src/abstract/Cluster.ts:306](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L306)

***

### island()

> **island**(`islandNo`): `Promise`\<[`Island`](Island.md)\<`TClient`\>\>

Returns an Island by its number.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `islandNo` | `number` |

#### Returns

`Promise`\<[`Island`](Island.md)\<`TClient`\>\>

#### Defined in

[src/abstract/Cluster.ts:325](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L325)

***

### islands()

> **islands**(): `Promise`\<[`Island`](Island.md)\<`TClient`\>[]\>

Returns all Islands in the Cluster.

#### Returns

`Promise`\<[`Island`](Island.md)\<`TClient`\>[]\>

#### Defined in

[src/abstract/Cluster.ts:336](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L336)

***

### rediscover()

> **rediscover**(): `Promise`\<`void`\>

Triggers shards rediscovery and finishes as soon as it's done. To be used
in unit tests mostly, because in real life, it's enough to just modify the
cluster configuration.

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/abstract/Cluster.ts:346](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L346)
