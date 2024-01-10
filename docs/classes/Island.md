[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Island

# Class: Island<TClient\>

Island is a collection of DB connections (represented as Clients) that
contains a single master server and any number of replicas.

Notice that Island is internal: it should never be returned to the caller
code. The caller code should use only Client and Shard abstractions.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

## Constructors

### constructor

• **new Island**<`TClient`\>(`clients`)

Initializes the Island by copying the Client references into it.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `clients` | readonly `TClient`[] |

#### Defined in

[src/abstract/Island.ts:20](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L20)

## Methods

### shardNos

▸ **shardNos**(): `Promise`<readonly `number`[]\>

Returns all Shards on the best available Client (preferably master, then
replicas). If some Clients are unavailable, tries its best to infer the
data from other Clients.

The method queries ALL clients in parallel, because the caller logic
anyways needs to know, who's master and who's replica, as a side effect of
the very 1st query after the Client creation. We infer that as a piggy back
after calling Client#shardNos().

#### Returns

`Promise`<readonly `number`[]\>

#### Defined in

[src/abstract/Island.ts:37](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L37)

___

### master

▸ **master**(): `TClient`

Returns the master Client among the Clients of this Island. In case all
Clients are read-only (replicas), still returns the 1st of them, assuming
that it's better to throw at the caller side on a failed write (at worst)
rather than here. It is not common to have an Island without a master
Client, that happens only temporarily during failover/switchover, so the
caller will likely rediscover and find a new master on a next retry.

#### Returns

`TClient`

#### Defined in

[src/abstract/Island.ts:83](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L83)

___

### replica

▸ **replica**(): `TClient`

Returns a random replica Client. In case there are no replicas, returns the
master Client.

#### Returns

`TClient`

#### Defined in

[src/abstract/Island.ts:101](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L101)

___

### prewarm

▸ **prewarm**(): `void`

Makes sure the prewarm loop is running on all Clients.

#### Returns

`void`

#### Defined in

[src/abstract/Island.ts:151](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L151)
