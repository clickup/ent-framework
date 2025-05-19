[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgClientOptions

# Interface: PgClientOptions\<TPool\>

Defined in: [src/pg/PgClient.ts:40](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L40)

Options for PgClient constructor.

## Extends

- [`ClientOptions`](ClientOptions.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TPool` *extends* `pg.Pool` | `pg.Pool` |

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="name"></a> `name` | `string` | Name of the Client; used for logging. |
| <a id="shardnamer"></a> `shardNamer?` | `null` \| [`ShardNamer`](../classes/ShardNamer.md) | Info on how to build/parse Shard names. If not set, then Cluster injects its own ShardNamer here right after creating a Client instance. |
| <a id="loggers"></a> `loggers?` | `null` \| [`Loggers`](Loggers.md) | Loggers to be called at different stages. Client code calls into them. Also, Cluster injects its own loggers here, in addition to the provided ones (if any). |
| <a id="batchdelayms"></a> `batchDelayMs?` | `MaybeCallable`\<`number`\> | If passed, there will be an artificial queries accumulation delay while batching the requests. Default is 0 (turned off). Passed to Batcher#batchDelayMs. |
| <a id="config"></a> `config` | `PoolConfig` & `object` | Node-Postgres config. We can't make it MaybeCallable unfortunately, because it's used to initialize Node-Postgres Pool. |
| <a id="createpool"></a> `createPool?` | (`config`: `PoolConfig`) => `TPool` | Should create an instance of Pool class compatible with node-postgres Pool. By default, node-postgres Pool is used. |
| <a id="maxconnlifetimems"></a> `maxConnLifetimeMs?` | `MaybeCallable`\<`number`\> | Close the connection after the query if it was opened long time ago. |
| <a id="maxconnlifetimejitter"></a> `maxConnLifetimeJitter?` | `MaybeCallable`\<`number`\> | Jitter for maxConnLifetimeMs. |
| <a id="prewarmintervalstep"></a> `prewarmIntervalStep?` | `MaybeCallable`\<`number`\> | Add not more than this number of connections in each prewarm interval. New connections are expensive to establish (especially when SSL is enabled). |
| <a id="prewarmintervalms"></a> `prewarmIntervalMs?` | `MaybeCallable`\<`number`\> | How often to send bursts of prewarm queries to all Clients to keep the minimal number of open connections. The default value is half of the default node-postgres'es idleTimeoutMillis=10s. Together with 1..1.5x jitter (default prewarmIntervalJitter=0.5), it is still slightly below idleTimeoutMillis, and thus, doesn't let Ent Framework close the connections prematurely. |
| <a id="prewarmintervaljitter"></a> `prewarmIntervalJitter?` | `MaybeCallable`\<`number`\> | Jitter for prewarmIntervalMs. |
| <a id="prewarmquery"></a> `prewarmQuery?` | `MaybeCallable`\<`string`\> | What prewarm query to send. |
| <a id="prewarmsubpools"></a> `prewarmSubPools?` | `boolean` | If true, also sends prewarm queries and keeps the min number of connections in all sub-pools. See pool() method for details. |
| <a id="hints"></a> `hints?` | `null` \| `MaybeCallable`\<[`Hints`](../type-aliases/Hints.md)\> | PG "SET key=value" hints to run before each query. Often times we use it to pass statement_timeout option since e.g. PGBouncer doesn't support per-connection statement timeout in transaction pooling mode: it throws "unsupported startup parameter" error. I.e. we may want to emit "SET statement_timeout TO ..." before each query in multi-query mode. |
| <a id="maxreplicationlagms"></a> `maxReplicationLagMs?` | `MaybeCallable`\<`number`\> | After how many milliseconds we give up waiting for the replica to catch up with the master. When role="replica", then this option is the only way to "unlatch" the reads from the master node after a write. |
| <a id="role"></a> `role?` | [`ClientRole`](../type-aliases/ClientRole.md) | Sometimes, the role of this Client is known statically, e.g. when pointing to AWS Aurora writer and reader endpoints. If "master" or "replica" are provided, then no attempt is made to use functions like pg_current_wal_insert_lsn() etc. (they are barely supported in e.g. AWS Aurora). Instead, for "replica" role, it is treated as "always lagging up until maxReplicationLagMs after the last write". If role="unknown", then auto-detection and automatic lag tracking is performed using pg_current_wal_insert_lsn() and other built-in PostgreSQL functions. |
| <a id="replicatimelineposrefreshms"></a> `replicaTimelinePosRefreshMs?` | `MaybeCallable`\<`number`\> | Up to how often we call TimelineManager#triggerRefresh(). |
