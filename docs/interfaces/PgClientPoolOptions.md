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

[src/abstract/Client.ts:16](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L16)

___

### loggers

• **loggers**: [`Loggers`](Loggers.md)

Loggers to be called at different stages.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[loggers](PgClientOptions.md#loggers)

#### Defined in

[src/abstract/Client.ts:18](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L18)

___

### batchDelayMs

• `Optional` **batchDelayMs**: `MaybeCallable`\<`number`\>

If passed, there will be an artificial queries accumulation delay while
batching the requests. Default is 0 (turned off). Passed to
Batcher#batchDelayMs.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[batchDelayMs](PgClientOptions.md#batchdelayms)

#### Defined in

[src/abstract/Client.ts:22](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L22)

___

### shards

• `Optional` **shards**: ``null`` \| \{ `nameFormat`: `string` ; `discoverQuery`: `MaybeCallable`\<`string`\>  }

Info on how to discover the shards.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[shards](PgClientOptions.md#shards)

#### Defined in

[src/pg/PgClient.ts:115](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L115)

___

### hints

• `Optional` **hints**: ``null`` \| `MaybeCallable`\<`Record`\<`string`, `string`\>\>

PG "SET key=value" hints to run before each query. Often times we use it
to pass statement_timeout option since e.g. PGBouncer doesn't support
per-connection statement timeout in transaction pooling mode: it throws
"unsupported startup parameter" error. I.e. we may want to emit "SET
statement_timeout TO ..." before each query in multi-query mode.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[hints](PgClientOptions.md#hints)

#### Defined in

[src/pg/PgClient.ts:127](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L127)

___

### maxReplicationLagMs

• `Optional` **maxReplicationLagMs**: `MaybeCallable`\<`number`\>

After how many milliseconds we give up waiting for the replica to catch up
with the master.

#### Inherited from

[PgClientOptions](PgClientOptions.md).[maxReplicationLagMs](PgClientOptions.md#maxreplicationlagms)

#### Defined in

[src/pg/PgClient.ts:130](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L130)

___

### replicaTimelinePosRefreshMs

• `Optional` **replicaTimelinePosRefreshMs**: `MaybeCallable`\<`number`\>

Up to how often we call TimelineManager#triggerRefresh().

#### Inherited from

[PgClientOptions](PgClientOptions.md).[replicaTimelinePosRefreshMs](PgClientOptions.md#replicatimelineposrefreshms)

#### Defined in

[src/pg/PgClient.ts:132](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L132)

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

[src/pg/PgClient.ts:139](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L139)

___

### config

• **config**: `PoolConfig`

#### Defined in

[src/pg/PgClientPool.ts:16](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L16)

___

### maxConnLifetimeMs

• `Optional` **maxConnLifetimeMs**: `number`

#### Defined in

[src/pg/PgClientPool.ts:17](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L17)

___

### maxConnLifetimeJitter

• `Optional` **maxConnLifetimeJitter**: `number`

#### Defined in

[src/pg/PgClientPool.ts:18](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L18)

___

### prewarmIntervalMs

• `Optional` **prewarmIntervalMs**: `number`

#### Defined in

[src/pg/PgClientPool.ts:19](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L19)

___

### prewarmQuery

• `Optional` **prewarmQuery**: `MaybeCallable`\<`string`\>

#### Defined in

[src/pg/PgClientPool.ts:20](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L20)
