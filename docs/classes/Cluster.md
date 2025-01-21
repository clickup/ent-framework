[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Cluster

# Class: Cluster\<TClient, TNode\>

Defined in: [src/abstract/Cluster.ts:101](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L101)

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

Defined in: [src/abstract/Cluster.ts:142](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L142)

Initializes the Cluster, but doesn't send any queries yet, even discovery
queries (also, no implicit prewarming).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ClusterOptions`](../interfaces/ClusterOptions.md)\<`TClient`, `TNode`\> |

#### Returns

[`Cluster`](Cluster.md)\<`TClient`, `TNode`\>

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="default_options"></a> `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`ClusterOptions`](../interfaces/ClusterOptions.md)\<[`Client`](Client.md), `never`\>\>\> | Default values for the constructor options. |
| <a id="options-1"></a> `options` | `Required`\<[`ClusterOptions`](../interfaces/ClusterOptions.md)\<`TClient`, `TNode`\>\> | Cluster configuration options. |

## Methods

### prewarm()

> **prewarm**(`randomizedDelayMs`, `onInitialPrewarm`?): `void`

Defined in: [src/abstract/Cluster.ts:230](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L230)

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

***

### globalShard()

> **globalShard**(): [`Shard`](Shard.md)\<`TClient`\>

Defined in: [src/abstract/Cluster.ts:261](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L261)

Returns a global Shard of the Cluster. This method is made synchronous
intentionally, to defer the I/O and possible errors to the moment of the
actual query.

#### Returns

[`Shard`](Shard.md)\<`TClient`\>

***

### nonGlobalShards()

> **nonGlobalShards**(): `Promise`\<readonly [`Shard`](Shard.md)\<`TClient`\>[]\>

Defined in: [src/abstract/Cluster.ts:268](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L268)

Returns all currently known (discovered) non-global Shards in the Cluster.

#### Returns

`Promise`\<readonly [`Shard`](Shard.md)\<`TClient`\>[]\>

***

### shard()

> **shard**(`id`): [`Shard`](Shard.md)\<`TClient`\>

Defined in: [src/abstract/Cluster.ts:288](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L288)

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

***

### shardByNo()

> **shardByNo**(`shardNo`): [`Shard`](Shard.md)\<`TClient`\>

Defined in: [src/abstract/Cluster.ts:301](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L301)

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

***

### randomShard()

> **randomShard**(`seed`?): `Promise`\<[`Shard`](Shard.md)\<`TClient`\>\>

Defined in: [src/abstract/Cluster.ts:311](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L311)

Returns a random Shard among the ones which are currently known
(discovered) in the Cluster.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `seed`? | `object` |

#### Returns

`Promise`\<[`Shard`](Shard.md)\<`TClient`\>\>

***

### island()

> **island**(`islandNo`): `Promise`\<[`Island`](Island.md)\<`TClient`\>\>

Defined in: [src/abstract/Cluster.ts:335](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L335)

Returns an Island by its number.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `islandNo` | `number` |

#### Returns

`Promise`\<[`Island`](Island.md)\<`TClient`\>\>

***

### islands()

> **islands**(): `Promise`\<[`Island`](Island.md)\<`TClient`\>[]\>

Defined in: [src/abstract/Cluster.ts:346](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L346)

Returns all Islands in the Cluster.

#### Returns

`Promise`\<[`Island`](Island.md)\<`TClient`\>[]\>

***

### rediscover()

> **rediscover**(): `Promise`\<`void`\>

Defined in: [src/abstract/Cluster.ts:356](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L356)

Triggers shards rediscovery and finishes as soon as it's done. To be used
in unit tests mostly, because in real life, it's enough to just modify the
cluster configuration.

#### Returns

`Promise`\<`void`\>
