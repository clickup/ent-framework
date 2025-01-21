[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / IslandOptions

# Interface: IslandOptions\<TClient\>

Defined in: [src/abstract/Island.ts:26](https://github.com/clickup/ent-framework/blob/master/src/abstract/Island.ts#L26)

Options for Island constructor.

## Type Parameters

| Type Parameter |
| ------ |
| `TClient` *extends* [`Client`](../classes/Client.md) |

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="no"></a> `no` | `number` | Island number. |
| <a id="clients"></a> `clients` | readonly `TClient`[] | Clients of that Island (the order is arbitrary). |
| <a id="createshard"></a> `createShard` | (`no`: `number`) => [`Shard`](../classes/Shard.md)\<`TClient`\> | Should return a Memoize'd Shards object by its number. |
| <a id="localcache"></a> `localCache?` | `null` \| [`LocalCache`](../classes/LocalCache.md)\<\{ `address`: `string`; `role`: [`ClientRole`](../type-aliases/ClientRole.md); \}\> | An auxillary LocalCache used to fallback-infer master/replica role in case some Client is unavailable right now. |
| <a id="shardnosconcurrentretrydelayms"></a> `shardNosConcurrentRetryDelayMs?` | `number` | If nonzero, runs the second shardNos() call attempt on a Client if the 1st call on that Client gets stuck for longer than the provided number of ms. This option is used to detect the unhealthy DB connection quicker, and thus, exit from rediscover() faster (the Shards map can likely be loaded from a replica still, so the down DB is not the end of the world). The idea is that the 1st shardNos() could get stuck due to the load balancer trying to wait until the DB goes back up again (e.g. for PgBouncer, that is query_wait_timeout situation; "pause_client" is printed to PgBouncer debug logs, and then the Client gets frozen for up to query_wait_timeout; other engines may have similar behavior). But for the NEW connections/queries, after a small delay, the load balancer may realize that the DB is really down (the load balancer typically can get "connection refused" while connecting to the DB server really quickly), and the 2nd shardNos() call will reject almost immediately ("fast fail" workflow), way before the 1st call rejects (e.g. for PgBouncer and query_wait_timeout=15s, the 1st call may get stuck for up to 15 seconds!). So, we will not wait that long to figure out that the DB is down, and will detect that situation quicker. Typically, the connection attempt from load balancer to an unhealthy DB server ends up quickly with "connection refused" TCP error (e.g. when the load balancer and the DB server run on the same host), so the value in this option can be small. But not always. Sometimes, the new connection from load balancer to the DB server gets stuck in "connecting..." state (e.g. this happens when the load balancer runs in a Docker container, and the DB container gets killed; the connection attempt will eventually fail, but in 1+ minutes and with "no route to host" error). In this case, the value in the option must be greater than e.g. server_connect_timeout (example for PgBouncer; basically, server_connect_timeout is PgBouncer's tool to detect "stuck" connection attempts (the connections which don't get "connection refused" quickly). |
