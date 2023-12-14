[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientPoolOptions

# Interface: SQLClientPoolOptions

Options for SQLClient constructor.

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

[src/abstract/Client.ts:15](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L15)

___

### loggers

• **loggers**: [`Loggers`](Loggers.md)

Loggers to be called at different stages.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[loggers](SQLClientOptions.md#loggers)

#### Defined in

[src/abstract/Client.ts:17](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L17)

___

### batchDelayMs

• `Optional` **batchDelayMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

If passed, there will be an artificial queries accumulation delay while
batching the requests. Default is 0 (turned off). Passed to
Batcher#batchDelayMs.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[batchDelayMs](SQLClientOptions.md#batchdelayms)

#### Defined in

[src/abstract/Client.ts:21](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L21)

___

### shards

• `Optional` **shards**: ``null`` \| { `nameFormat`: `string` ; `discoverQuery`: `string`  }

Info on how to discover the shards.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[shards](SQLClientOptions.md#shards)

#### Defined in

[src/sql/SQLClient.ts:29](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L29)

___

### hints

• `Optional` **hints**: ``null`` \| `Record`<`string`, `string`\>

PG "SET key=value" hints to run before each query.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[hints](SQLClientOptions.md#hints)

#### Defined in

[src/sql/SQLClient.ts:37](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L37)

___

### maxReplicationLagMs

• `Optional` **maxReplicationLagMs**: `number`

After how many milliseconds we give up waiting for the replica to catch up
with the master.

#### Inherited from

[SQLClientOptions](SQLClientOptions.md).[maxReplicationLagMs](SQLClientOptions.md#maxreplicationlagms)

#### Defined in

[src/sql/SQLClient.ts:40](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L40)

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

[src/sql/SQLClient.ts:47](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L47)

___

### config

• **config**: `PoolConfig`

#### Defined in

[src/sql/SQLClientPool.ts:17](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L17)

___

### maxConnLifetimeMs

• `Optional` **maxConnLifetimeMs**: `number`

#### Defined in

[src/sql/SQLClientPool.ts:18](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L18)

___

### maxConnLifetimeJitter

• `Optional` **maxConnLifetimeJitter**: `number`

#### Defined in

[src/sql/SQLClientPool.ts:19](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L19)

___

### prewarmIntervalMs

• `Optional` **prewarmIntervalMs**: `number`

#### Defined in

[src/sql/SQLClientPool.ts:20](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L20)

___

### prewarmQuery

• `Optional` **prewarmQuery**: [`MaybeCallable`](../modules.md#maybecallable)<`string`\>

#### Defined in

[src/sql/SQLClientPool.ts:21](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L21)
