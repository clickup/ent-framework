[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientOptions

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

[src/abstract/Client.ts:15](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L15)

___

### loggers

• **loggers**: [`Loggers`](Loggers.md)

Loggers to be called at different stages.

#### Inherited from

[ClientOptions](ClientOptions.md).[loggers](ClientOptions.md#loggers)

#### Defined in

[src/abstract/Client.ts:17](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L17)

___

### batchDelayMs

• `Optional` **batchDelayMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

If passed, there will be an artificial queries accumulation delay while
batching the requests. Default is 0 (turned off). Passed to
Batcher#batchDelayMs.

#### Inherited from

[ClientOptions](ClientOptions.md).[batchDelayMs](ClientOptions.md#batchdelayms)

#### Defined in

[src/abstract/Client.ts:21](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L21)

___

### shards

• `Optional` **shards**: ``null`` \| { `nameFormat`: `string` ; `discoverQuery`: `string`  }

Info on how to discover the shards.

#### Defined in

[src/sql/SQLClient.ts:29](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L29)

___

### hints

• `Optional` **hints**: ``null`` \| `Record`<`string`, `string`\>

PG "SET key=value" hints to run before each query.

#### Defined in

[src/sql/SQLClient.ts:37](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L37)

___

### maxReplicationLagMs

• `Optional` **maxReplicationLagMs**: `number`

After how many milliseconds we give up waiting for the replica to catch up
with the master.

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

#### Defined in

[src/sql/SQLClient.ts:47](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L47)
