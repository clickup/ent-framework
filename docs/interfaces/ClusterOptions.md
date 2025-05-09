[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ClusterOptions

# Interface: ClusterOptions\<TClient, TNode\>

Defined in: [src/abstract/Cluster.ts:45](https://github.com/clickup/ent-framework/blob/master/src/abstract/Cluster.ts#L45)

Options for Cluster constructor.

## Type Parameters

| Type Parameter |
| ------ |
| `TClient` *extends* [`Client`](../classes/Client.md) |
| `TNode` |

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="islands"></a> `islands` | `MaybeAsyncCallable`\<[`ClusterIslands`](../type-aliases/ClusterIslands.md)\<`TNode`\>\> | Islands configuration of the Cluster. |
| <a id="createclient"></a> `createClient` | (`node`: `TNode`) => `TClient` | Given a node of some Island, instantiates a Client for this node. Called when a new node appears in the Cluster statically or dynamically. |
| <a id="loggers"></a> `loggers` | [`Loggers`](Loggers.md) | Loggers to be injected into all Clients returned by createClient(). |
| <a id="localcache"></a> `localCache?` | `null` \| [`LocalCache`](../classes/LocalCache.md)\<`never`\> | An instance of LocalCache which may be used for auxiliary purposes when discovering Shards/Clients. |
| <a id="reloadislandsintervalms"></a> `reloadIslandsIntervalMs?` | `MaybeCallable`\<`number`\> | How often to recheck for changes in `options.islands`. If it is SYNC, then by default - often, like every 500 ms (since it's assumed that `options.islands` calculation is cheap). If it is ASYNC, then by default - not so often, every `shardsDiscoverIntervalMs` (we assume that getting the list of Island nodes may be expensive, e.g. fetching from AWS API or so). If the Islands list here changes, then we trigger Shards rediscovery and Clients recreation ASAP. |
| <a id="shardnamer"></a> `shardNamer?` | `null` \| [`ShardNamer`](../classes/ShardNamer.md) | Info on how to build/parse Shard names. |
| <a id="shardsdiscoverintervalms"></a> `shardsDiscoverIntervalMs?` | `MaybeCallable`\<`number`\> | How often to run Shards rediscovery in normal circumstances. |
| <a id="shardsdiscoverintervaljitter"></a> `shardsDiscoverIntervalJitter?` | `MaybeCallable`\<`number`\> | Jitter for shardsDiscoverIntervalMs and reloadIslandsIntervalMs. |
| <a id="locateislanderrorretrycount"></a> `locateIslandErrorRetryCount?` | `MaybeCallable`\<`number`\> | Used in the following situations: 1. If we think that we know Island of a particular Shard, but an attempt to access it fails, this means that maybe the Shard is migrating to another Island. In this case, we wait a bit and retry that many times. We should not do it too many times though, because all DB requests will be blocked waiting for the resolution. 2. If we sent a write request to a Client, but it appeared that this Client is a replica, and the master moved to some other Client. In this case, we wait a bit and ping all Clients of the Island to refresh, who is master and who is replica. |
| <a id="locateislanderrorrediscoverclusterdelayms"></a> `locateIslandErrorRediscoverClusterDelayMs?` | `MaybeCallable`\<`number`\> | How much time to wait before we retry rediscovering the entire Cluster. The time here should be just enough to wait for switching the Shard from one Island to another (typically quick). |
| <a id="locateislanderrorrediscoverislanddelayms"></a> `locateIslandErrorRediscoverIslandDelayMs?` | `MaybeCallable`\<`number`\> | How much time to wait before sending discover requests to all Clients of the Island trying to find the new master. The time here may reach several seconds, since some DBs shut down the old master and promote some replica to it not simultaneously. |
