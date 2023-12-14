[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / ClusterOptions

# Interface: ClusterOptions<TClient, TNode\>

Options for Cluster constructor.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](../classes/Client.md) |
| `TNode` | `TNode` |

## Properties

### islands

• **islands**: readonly { `no`: `number` ; `nodes`: readonly TNode[]  }[]

Islands configuration of the Cluster. May be changed dynamically by
passing it as a getter.

#### Defined in

[src/abstract/Cluster.ts:30](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L30)

___

### createClient

• **createClient**: (`node`: `TNode`, `nodeNo`: `number`) => `TClient`

#### Type declaration

▸ (`node`, `nodeNo`): `TClient`

Given a node of some Island, instantiates a Client for this node. Called
when a new node appears in the Cluster statically or dynamically.

##### Parameters

| Name | Type |
| :------ | :------ |
| `node` | `TNode` |
| `nodeNo` | `number` |

##### Returns

`TClient`

#### Defined in

[src/abstract/Cluster.ts:33](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L33)

___

### shardsDiscoverIntervalMs

• `Optional` **shardsDiscoverIntervalMs**: `number` \| () => `number`

How often to run Shards rediscovery in normal circumstances.

#### Defined in

[src/abstract/Cluster.ts:35](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L35)

___

### shardsDiscoverErrorRetryCount

• `Optional` **shardsDiscoverErrorRetryCount**: `number`

If there were DB errors during Shards discovery (e.g. transport errors,
which is rare), the discovery is retried that many times before giving up
and throwing the error through. The number here can be high, because
rediscovery happens in background.

#### Defined in

[src/abstract/Cluster.ts:40](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L40)

___

### shardsDiscoverErrorRetryDelayMs

• `Optional` **shardsDiscoverErrorRetryDelayMs**: `number`

If there were DB errors during Shards discovery (rare), this is how much
we wait between attempts.

#### Defined in

[src/abstract/Cluster.ts:43](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L43)

___

### locateIslandErrorRetryCount

• `Optional` **locateIslandErrorRetryCount**: `number`

If we think that we know Island of a particular Shard, but an attempt to
access it fails, this means that maybe the Shard is migrating to another
Island. In this case, we wait a bit and retry that many times. We should
not do it too many times though, because all DB requests will be blocked
waiting for the resolution.

#### Defined in

[src/abstract/Cluster.ts:49](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L49)

___

### locateIslandErrorRetryDelayMs

• `Optional` **locateIslandErrorRetryDelayMs**: `number`

How much time to wait between the retries mentioned above. The time here
should be just enough to wait for switching the Shard from one Island to
another (typically quick).

#### Defined in

[src/abstract/Cluster.ts:53](https://github.com/clickup/rest-client/blob/master/src/abstract/Cluster.ts#L53)
