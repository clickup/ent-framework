[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / ClusterOptions

# Interface: ClusterOptions\<TClient, TNode\>

Options for Cluster constructor.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](../classes/Client.md) |
| `TNode` | `TNode` |

## Properties

### islands

• **islands**: `MaybeCallable`\<readonly \{ `no`: `number` ; `nodes`: readonly `TNode`[]  }[]\>

Islands configuration of the Cluster.

#### Defined in

[src/abstract/Cluster.ts:35](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L35)

___

### createClient

• **createClient**: (`node`: `TNode`) => `TClient`

Given a node of some Island, instantiates a Client for this node. Called
when a new node appears in the Cluster statically or dynamically.

#### Type declaration

▸ (`node`): `TClient`

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `TNode` |

##### Returns

`TClient`

#### Defined in

[src/abstract/Cluster.ts:40](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L40)

___

### loggers

• **loggers**: [`Loggers`](Loggers.md)

Loggers to be injected into all Clients returned by createClient().

#### Defined in

[src/abstract/Cluster.ts:42](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L42)

___

### localCache

• `Optional` **localCache**: ``null`` \| [`LocalCache`](../classes/LocalCache.md)\<`never`\>

An instance of LocalCache which may be used for auxillary purposes when
discovering Shards/Clients.

#### Defined in

[src/abstract/Cluster.ts:45](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L45)

___

### shardsDiscoverIntervalMs

• `Optional` **shardsDiscoverIntervalMs**: `MaybeCallable`\<`number`\>

How often to run Shards rediscovery in normal circumstances.

#### Defined in

[src/abstract/Cluster.ts:47](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L47)

___

### shardsDiscoverRecheckIslandsIntervalMs

• `Optional` **shardsDiscoverRecheckIslandsIntervalMs**: `MaybeCallable`\<`number`\>

How often to recheck for changes in options.islands (typically, often,
since it's assumed that options.islands calculation is cheap). If the
Cluster configuration is changed, then we trigger rediscovery ASAP.

#### Defined in

[src/abstract/Cluster.ts:51](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L51)

___

### locateIslandErrorRetryCount

• `Optional` **locateIslandErrorRetryCount**: `MaybeCallable`\<`number`\>

Used in the following situations:
1. If we think that we know Island of a particular Shard, but an attempt to
   access it fails, this means that maybe the Shard is migrating to another
   Island. In this case, we wait a bit and retry that many times. We should
   not do it too many times though, because all DB requests will be blocked
   waiting for the resolution.
2. If we sent a write request to a Client, but it appeared that this Client
   is a replica, and the master moved to some other Client. In this case,
   we wait a bit and ping all Clients of the Island to refresh, who is
   master and who is replica.

#### Defined in

[src/abstract/Cluster.ts:62](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L62)

___

### locateIslandErrorRediscoverClusterDelayMs

• `Optional` **locateIslandErrorRediscoverClusterDelayMs**: `MaybeCallable`\<`number`\>

How much time to wait before we retry rediscovering the entire Cluster.
The time here should be just enough to wait for switching the Shard from
one Island to another (typically quick).

#### Defined in

[src/abstract/Cluster.ts:66](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L66)

___

### locateIslandErrorRediscoverIslandDelayMs

• `Optional` **locateIslandErrorRediscoverIslandDelayMs**: `MaybeCallable`\<`number`\>

How much time to wait before sending discover requests to all Clients of
the Island trying to find the new master. The time here may reach several
seconds, since some DBs shut down the old master and promote some replica
to it not simultaneously.

#### Defined in

[src/abstract/Cluster.ts:71](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L71)
