[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientOptions

# Interface: SQLClientOptions

Options for SQLClient constructor.

## Hierarchy

- [`ClientOptions`](ClientOptions.md)

  ↳ **`SQLClientOptions`**

  ↳↳ [`SQLClientPoolOptions`](SQLClientPoolOptions.md)

## Properties

### name

• **name**: `string`

Name of the Client; used for logging.

#### Inherited from

[ClientOptions](ClientOptions.md).[name](ClientOptions.md#name)

#### Defined in

[src/abstract/Client.ts:16](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L16)

___

### loggers

• **loggers**: [`Loggers`](Loggers.md)

Loggers to be called at different stages.

#### Inherited from

[ClientOptions](ClientOptions.md).[loggers](ClientOptions.md#loggers)

#### Defined in

[src/abstract/Client.ts:18](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L18)

___

### batchDelayMs

• `Optional` **batchDelayMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

If passed, there will be an artificial queries accumulation delay while
batching the requests. Default is 0 (turned off). Passed to
Batcher#batchDelayMs.

#### Inherited from

[ClientOptions](ClientOptions.md).[batchDelayMs](ClientOptions.md#batchdelayms)

#### Defined in

[src/abstract/Client.ts:22](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L22)

___

### shards

• `Optional` **shards**: ``null`` \| { `nameFormat`: `string` ; `discoverQuery`: [`MaybeCallable`](../modules.md#maybecallable)<`string`\>  }

Info on how to discover the shards.

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

#### Defined in

[src/sql/SQLClient.ts:128](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L128)

___

### maxReplicationLagMs

• `Optional` **maxReplicationLagMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

After how many milliseconds we give up waiting for the replica to catch up
with the master.

#### Defined in

[src/sql/SQLClient.ts:131](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L131)

___

### replicaTimelinePosRefreshMs

• `Optional` **replicaTimelinePosRefreshMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

Up to how often we call TimelineManager#triggerRefresh().

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

#### Defined in

[src/sql/SQLClient.ts:140](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L140)
