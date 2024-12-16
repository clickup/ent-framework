[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgClientPoolOptions

# Interface: PgClientPoolOptions

Options for PgClientPool constructor.

## Extends

- [`PgClientOptions`](PgClientOptions.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | Name of the Client; used for logging. |
| `loggers?` | `null` \| [`Loggers`](Loggers.md) | Loggers to be called at different stages. |
| `batchDelayMs?` | `MaybeCallable`\<`number`\> | If passed, there will be an artificial queries accumulation delay while batching the requests. Default is 0 (turned off). Passed to Batcher#batchDelayMs. |
| `shards?` | `null` \| \{ `nameFormat`: `string`; `discoverQuery`: `MaybeCallable`\<`string`\>; \} | Info on how to discover the shards. |
| `hints?` | `null` \| `MaybeCallable`\<`Record`\<`string`, `undefined` \| `string`\>\> | PG "SET key=value" hints to run before each query. Often times we use it to pass statement_timeout option since e.g. PGBouncer doesn't support per-connection statement timeout in transaction pooling mode: it throws "unsupported startup parameter" error. I.e. we may want to emit "SET statement_timeout TO ..." before each query in multi-query mode. |
| `maxReplicationLagMs?` | `MaybeCallable`\<`number`\> | After how many milliseconds we give up waiting for the replica to catch up with the master. |
| `replicaTimelinePosRefreshMs?` | `MaybeCallable`\<`number`\> | Up to how often we call TimelineManager#triggerRefresh(). |
| `isAlwaysLaggingReplica?` | `boolean` | If true, this Client pretends to be an "always lagging" replica. It is helpful while testing replication lag code (typically done by just manually creating a copy of the database and declaring it as a replica, and then setting isAlwaysLaggingReplica=true for it). For such cases, we treat such "replica" as always lagging, i.e. having pos=0 which is less than any known master's pos. |
| `config` | `PoolConfig` | Node-Postgres config. We can't make it MaybeCallable unfortunately, because it's used to initialize Node-Postgres Pool. |
| `Pool?` | *typeof* `Pool` | Pool class (constructor) compatible with node-postgres Pool. |
| `maxConnLifetimeMs?` | `MaybeCallable`\<`number`\> | Close the connection after the query if it was opened long time ago. |
| `maxConnLifetimeJitter?` | `MaybeCallable`\<`number`\> | Jitter for maxConnLifetimeMs. |
| `prewarmIntervalStep?` | `MaybeCallable`\<`number`\> | Add not more than this number of connections in each prewarm interval. New connections are expensive to establish (especially when SSL is enabled). |
| `prewarmIntervalMs?` | `MaybeCallable`\<`number`\> | How often to send bursts of prewarm queries to all Clients to keep the minimal number of open connections. |
| `prewarmIntervalJitter?` | `MaybeCallable`\<`number`\> | Jitter for prewarmIntervalMs. |
| `prewarmQuery?` | `MaybeCallable`\<`string`\> | What prewarm query to send. |
