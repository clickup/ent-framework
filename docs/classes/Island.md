[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Island

# Class: Island\<TClient\>

Defined in: [src/abstract/Island.ts:94](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L94)

Island is a moderately short-lived collection of DB connections (represented
as Clients) that contains a single master Client and any number of replicas.

- In normal situations, you don't likely need to work with Islands directly,
  you can rely on higher level abstractions which support automatic
  rediscovery and retries: Ent (or lower level Shard and Schema).
- Islands are helpful mostly when working with cross-Shards logic.
- Island is somewhat temporary: if the Cluster is reconfigured in real-time,
  then its Island objects may be recycled and re-created, and the
  corresponding Clients may be ended. This also applies to any given Client
  instance. Don't retain and reuse those objects for too long. The reliable
  abstractions (resilient to disconnects, shards migration, failover etc.)
  start from Shard level.
- There is no guarantee that the data returned by shards(), master() or
  replica() will be up to date. Shards may be just migrated to another
  Island. Master may become a replica, or vice versa.

## Type Parameters

| Type Parameter |
| ------ |
| `TClient` *extends* [`Client`](Client.md) |

## Constructors

### new Island()

> **new Island**\<`TClient`\>(`options`): [`Island`](Island.md)\<`TClient`\>

Defined in: [src/abstract/Island.ts:121](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L121)

Initializes the Island by copying the Client references into it.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`IslandOptions`](../interfaces/IslandOptions.md)\<`TClient`\> |

#### Returns

[`Island`](Island.md)\<`TClient`\>

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="default_options"></a> `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`IslandOptions`](../interfaces/IslandOptions.md)\<[`Client`](Client.md)\>\>\> | Default values for the constructor options. |
| <a id="options-1"></a> `options` | `Required`\<[`IslandOptions`](../interfaces/IslandOptions.md)\<`TClient`\>\> | Island configuration options. |

## Accessors

### no

#### Get Signature

> **get** **no**(): `number`

Defined in: [src/abstract/Island.ts:133](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L133)

Island number.

##### Returns

`number`

***

### clients

#### Get Signature

> **get** **clients**(): readonly `TClient`[]

Defined in: [src/abstract/Island.ts:140](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L140)

The list of Clients in this Island. No assumptions about the order.

##### Returns

readonly `TClient`[]

## Methods

### rediscover()

> **rediscover**(): `Promise`\<[`SwallowedErrorLoggerProps`](../interfaces/SwallowedErrorLoggerProps.md)[]\>

Defined in: [src/abstract/Island.ts:157](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L157)

Queries for Shards on the best available Client (preferably master, then
replicas) and stores the result internally, available for the further
shards() call.
- If some Clients are unavailable, tries its best to infer the data from
  other Clients.
- The method queries ALL clients in parallel, because the caller logic
  anyways needs to know, who's master and who's replica, as a side effect
  of the very 1st query after the Client creation. We infer that as a piggy
  back after calling Client#shardNos().
- In case we could not discover shards, returns the list of errors happened
  during the discovery.

#### Returns

`Promise`\<[`SwallowedErrorLoggerProps`](../interfaces/SwallowedErrorLoggerProps.md)[]\>

***

### shards()

> **shards**(): [`Shard`](Shard.md)\<`TClient`\>[]

Defined in: [src/abstract/Island.ts:224](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L224)

Returns the currently best-known Shards on this Island. This method is
needed only when working with cross-Shards logic; in normal situations, it
is not called much.

#### Returns

[`Shard`](Shard.md)\<`TClient`\>[]

***

### master()

> **master**(): `TClient`

Defined in: [src/abstract/Island.ts:252](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L252)

Returns the currently best-known master Client among the Clients of this
Island.

- If all masters are unhealthy, we still return one of them and prefer not
  to fall back on a replica, because otherwise, we'll see non-obvious
  errors in logs ("can't write in a read-only Client" or so) and suspect
  that there is a bug in logic, although there is really no bug, it's just
  the master node went down. It's way better to throw a straightforward
  error like "Client is down".
- If we can't find a master, but there is a list of Clients with unknown
  roles, prefer returning one of them vs. any known replica, since there is
  a chance that among those unknown Clients, there will be a master.
- In case all Clients are read-only (replicas), still returns the 1st of
  them, assuming that it's better to throw at the caller side on a failed
  write (at worst) rather than here. It is not common to have an Island
  without a master Client, that happens only temporarily during
  failover/switchover, so the caller will likely rediscover and find a new
  master on a next retry.

#### Returns

`TClient`

***

### replica()

> **replica**(): `TClient`

Defined in: [src/abstract/Island.ts:279](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L279)

Returns a currently best-known random replica Client. In case there are no
replicas, returns the master Client.

#### Returns

`TClient`
