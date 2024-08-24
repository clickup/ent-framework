[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgClientPoolOptions

# Interface: PgClientPoolOptions

Options for PgClientPool constructor.

## Hierarchy

- [`PgClientOptions`](PgClientOptions.md)

  ↳ **`PgClientPoolOptions`**

## Properties

### name

• **name**: `string`

Name of the Client; used for logging.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[name](PgClientOptions.md#name)

#### Defined in

[src/abstract/Client.ts:18](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L18)

___

### loggers

• `Optional` **loggers**: ``null`` \| [`Loggers`](Loggers.md)

Loggers to be called at different stages.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[loggers](PgClientOptions.md#loggers)

#### Defined in

[src/abstract/Client.ts:20](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L20)

___

### batchDelayMs

• `Optional` **batchDelayMs**: `MaybeCallable`\<`number`\>

If passed, there will be an artificial queries accumulation delay while
batching the requests. Default is 0 (turned off). Passed to
Batcher#batchDelayMs.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[batchDelayMs](PgClientOptions.md#batchdelayms)

#### Defined in

[src/abstract/Client.ts:24](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L24)

___

### shards

• `Optional` **shards**: ``null`` \| \{ `nameFormat`: `string` ; `discoverQuery`: `MaybeCallable`\<`string`\>  }

Info on how to discover the shards.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[shards](PgClientOptions.md#shards)

#### Defined in

[src/pg/PgClient.ts:41](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L41)

___

### hints

• `Optional` **hints**: ``null`` \| `MaybeCallable`\<`Record`\<`string`, `undefined` \| `string`\>\>

PG "SET key=value" hints to run before each query. Often times we use it
to pass statement_timeout option since e.g. PGBouncer doesn't support
per-connection statement timeout in transaction pooling mode: it throws
"unsupported startup parameter" error. I.e. we may want to emit "SET
statement_timeout TO ..." before each query in multi-query mode.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[hints](PgClientOptions.md#hints)

#### Defined in

[src/pg/PgClient.ts:53](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L53)

___

### maxReplicationLagMs

• `Optional` **maxReplicationLagMs**: `MaybeCallable`\<`number`\>

After how many milliseconds we give up waiting for the replica to catch up
with the master.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[maxReplicationLagMs](PgClientOptions.md#maxreplicationlagms)

#### Defined in

[src/pg/PgClient.ts:56](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L56)

___

### replicaTimelinePosRefreshMs

• `Optional` **replicaTimelinePosRefreshMs**: `MaybeCallable`\<`number`\>

Up to how often we call TimelineManager#triggerRefresh().

#### Inherited from

[PgClientOptions](PgClientOptions.md).[replicaTimelinePosRefreshMs](PgClientOptions.md#replicatimelineposrefreshms)

#### Defined in

[src/pg/PgClient.ts:58](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L58)

___

### isAlwaysLaggingReplica

• `Optional` **isAlwaysLaggingReplica**: `boolean`

If true, this Client pretends to be an "always lagging" replica. It is
helpful while testing replication lag code (typically done by just manually
creating a copy of the database and declaring it as a replica, and then
setting isAlwaysLaggingReplica=true for it). For such cases, we treat such
"replica" as always lagging, i.e. having pos=0 which is less than any known
master's pos.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[isAlwaysLaggingReplica](PgClientOptions.md#isalwayslaggingreplica)

#### Defined in

[src/pg/PgClient.ts:65](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L65)

___

### config

• **config**: `PoolConfig`

Node-Postgres config. We can't make it MaybeCallable unfortunately,
because it's used to initialize Node-Postgres Pool.

#### Defined in

[src/pg/PgClientPool.ts:21](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L21)

___

### maxConnLifetimeMs

• `Optional` **maxConnLifetimeMs**: `MaybeCallable`\<`number`\>

Close the connection after the query if it was opened long time ago.

#### Defined in

[src/pg/PgClientPool.ts:23](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L23)

___

### maxConnLifetimeJitter

• `Optional` **maxConnLifetimeJitter**: `MaybeCallable`\<`number`\>

Jitter for old connections closure.

#### Defined in

[src/pg/PgClientPool.ts:25](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L25)

___

### prewarmIntervalMs

• `Optional` **prewarmIntervalMs**: `MaybeCallable`\<`number`\>

How often to send bursts of prewarm queries to all Clients to keep the
minimal number of open connections.

#### Defined in

[src/pg/PgClientPool.ts:28](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L28)

___

### prewarmQuery

• `Optional` **prewarmQuery**: `MaybeCallable`\<`string`\>

What prewarm query to send.

#### Defined in

[src/pg/PgClientPool.ts:30](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L30)
