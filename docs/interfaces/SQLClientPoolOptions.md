[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientPoolOptions

# Interface: SQLClientPoolOptions

Options for SQLClientPool constructor.

## Hierarchy

- [`SQLClientOptions`](SQLClientOptions.md)

  ↳ **`SQLClientPoolOptions`**

## Properties

### name

• **name**: `string`

Name of the Client; used for logging.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[name](SQLClientOptions.md#name)

#### Defined in

[src/abstract/Client.ts:16](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L16)

___

### loggers

• **loggers**: [`Loggers`](Loggers.md)

Loggers to be called at different stages.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[loggers](SQLClientOptions.md#loggers)

#### Defined in

[src/abstract/Client.ts:18](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L18)

___

### batchDelayMs

• `Optional` **batchDelayMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

If passed, there will be an artificial queries accumulation delay while
batching the requests. Default is 0 (turned off). Passed to
Batcher#batchDelayMs.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[batchDelayMs](SQLClientOptions.md#batchdelayms)

#### Defined in

[src/abstract/Client.ts:22](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L22)

___

### shards

• `Optional` **shards**: ``null`` \| { `nameFormat`: `string` ; `discoverQuery`: [`MaybeCallable`](../modules.md#maybecallable)<`string`\>  }

Info on how to discover the shards.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[shards](SQLClientOptions.md#shards)

#### Defined in

[src/sql/SQLClient.ts:116](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L116)

___

### hints

• `Optional` **hints**: ``null`` \| [`MaybeCallable`](../modules.md#maybecallable)<`Record`<`string`, `string`\>\>

PG "SET key=value" hints to run before each query. Often times we use it
to pass statement_timeout option since e.g. PGBouncer doesn't support
per-connection statement timeout in transaction pooling mode: it throws
"unsupported startup parameter" error. I.e. we may want to emit "SET
statement_timeout TO ..." before each query in multi-query mode.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[hints](SQLClientOptions.md#hints)

#### Defined in

[src/sql/SQLClient.ts:128](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L128)

___

### maxReplicationLagMs

• `Optional` **maxReplicationLagMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

After how many milliseconds we give up waiting for the replica to catch up
with the master.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[maxReplicationLagMs](SQLClientOptions.md#maxreplicationlagms)

#### Defined in

[src/sql/SQLClient.ts:131](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L131)

___

### replicaTimelinePosRefreshMs

• `Optional` **replicaTimelinePosRefreshMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

Up to how often we call TimelineManager#triggerRefresh().

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[replicaTimelinePosRefreshMs](SQLClientOptions.md#replicatimelineposrefreshms)

#### Defined in

[src/sql/SQLClient.ts:133](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L133)

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

[SQLClientOptions](SQLClientOptions.md).[isAlwaysLaggingReplica](SQLClientOptions.md#isalwayslaggingreplica)

#### Defined in

[src/sql/SQLClient.ts:140](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L140)

___

### config

• **config**: `PoolConfig`

#### Defined in

[src/sql/SQLClientPool.ts:16](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L16)

___

### maxConnLifetimeMs

• `Optional` **maxConnLifetimeMs**: `number`

#### Defined in

[src/sql/SQLClientPool.ts:17](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L17)

___

### maxConnLifetimeJitter

• `Optional` **maxConnLifetimeJitter**: `number`

#### Defined in

[src/sql/SQLClientPool.ts:18](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L18)

___

### prewarmIntervalMs

• `Optional` **prewarmIntervalMs**: `number`

#### Defined in

[src/sql/SQLClientPool.ts:19](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L19)

___

### prewarmQuery

• `Optional` **prewarmQuery**: [`MaybeCallable`](../modules.md#maybecallable)<`string`\>

#### Defined in

[src/sql/SQLClientPool.ts:20](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L20)
