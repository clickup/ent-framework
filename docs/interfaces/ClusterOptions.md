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

Given a node of some Island, instantiates a Client for this node. Called
when a new node appears in the Cluster statically or dynamically.

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `TNode` |

##### Returns

`TClient`

#### Defined in

[src/abstract/Cluster.ts:40](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L40)

___

### shardsDiscoverIntervalMs

• `Optional` **shardsDiscoverIntervalMs**: `MaybeCallable`\<`number`\>

How often to run Shards rediscovery in normal circumstances.

#### Defined in

[src/abstract/Cluster.ts:42](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L42)

___

### shardsDiscoverRecheckIslandsIntervalMs

• `Optional` **shardsDiscoverRecheckIslandsIntervalMs**: `MaybeCallable`\<`number`\>

How often to recheck for changes in options.islands (typically, often,
since it's assumed that options.islands calculation is cheap). If the
Cluster configuration is changed, then we trigger rediscovery ASAP.

#### Defined in

[src/abstract/Cluster.ts:46](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L46)

___

### shardsDiscoverErrorRetryCount

• `Optional` **shardsDiscoverErrorRetryCount**: `MaybeCallable`\<`number`\>

If there were DB errors during Shards discovery (e.g. transport errors,
which is rare), the discovery is retried that many times before giving up
and throwing the error through. The number here can be high, because
rediscovery happens in background.

#### Defined in

[src/abstract/Cluster.ts:51](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L51)

___

### shardsDiscoverErrorRetryDelayMs

• `Optional` **shardsDiscoverErrorRetryDelayMs**: `MaybeCallable`\<`number`\>

If there were DB errors during Shards discovery (rare), this is how much
we wait between attempts.

#### Defined in

[src/abstract/Cluster.ts:54](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L54)

___

### locateIslandErrorRetryCount

• `Optional` **locateIslandErrorRetryCount**: `MaybeCallable`\<`number`\>

If we think that we know Island of a particular Shard, but an attempt to
access it fails, this means that maybe the Shard is migrating to another
Island. In this case, we wait a bit and retry that many times. We should
not do it too many times though, because all DB requests will be blocked
waiting for the resolution.

#### Defined in

[src/abstract/Cluster.ts:60](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L60)

___

### locateIslandErrorRetryDelayMs

• `Optional` **locateIslandErrorRetryDelayMs**: `MaybeCallable`\<`number`\>

How much time to wait between the retries mentioned above. The time here
should be just enough to wait for switching the Shard from one Island to
another (typically quick).

#### Defined in

[src/abstract/Cluster.ts:64](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L64)
