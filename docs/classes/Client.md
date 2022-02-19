[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Client

# Class: Client

## Hierarchy

- **`Client`**

  ↳ [`SQLClient`](../interfaces/SQLClient.md)

  ↳ [`SQLClientPool`](SQLClientPool.md)

  ↳ [`TestSQLClient`](TestSQLClient.md)

## Constructors

### constructor

• **new Client**(`name`, `isMaster`, `loggers`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `isMaster` | `boolean` |
| `loggers` | [`Loggers`](../interfaces/Loggers.md) |

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:59](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L59)

## Properties

### isMaster

• `Readonly` **isMaster**: `boolean`

___

### loggers

• `Readonly` **loggers**: [`Loggers`](../interfaces/Loggers.md)

___

### name

• `Readonly` **name**: `string`

___

### shardName

• `Readonly` `Abstract` **shardName**: `string`

Each Client may be bound to some shard, so the queries executed via it will
be namespaced to this shard. E.g. in PostgreSQL, shard name is schema name
(or "public" if the client wasn't created by withShard() method).

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:51](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L51)

___

### timelineManager

• `Readonly` `Abstract` **timelineManager**: [`TimelineManager`](TimelineManager.md)

Tracks the master/replica replication timeline position. Shared across all
the clients within the same island.

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:57](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L57)

## Methods

### batcher

▸ **batcher**<`TInput`, `TOutput`\>(`_QueryClass`, `_schema`, `_additionalShape`, `runnerCreator`): [`Batcher`](Batcher.md)<`TInput`, `TOutput`\>

Batcher is per-client per-query-type per-table-name-and-shape:
- Per-client means that batchers are removed as soon as the client is
  removed, i.e. the client owns all the batchers for all tables.
- Per-query-type means that the batcher for a SELECT query is different
  from the batcher for an INSERT query (obviously).
- Per-table-name-and-shape means that each table has its own set of
  batchers (obviously). Also, some queries may be complex (like UPDATE), so
  the batcher also depends on the "shape" - the list of fields we're
  updating.

Also, for every Batcher, there is exactly one Runner (which knows how to
build the actual query in the context of the current client). Batchers are
generic (like DataLoader, but more general), and Runners are very custom to
the query (and are private to these queries).

All that means that in a 1000-shard 20-table cluster we'll eventually have
1000x20x8 Batchers/Runners (assuming we have 8 different operations).

#### Type parameters

| Name |
| :------ |
| `TInput` |
| `TOutput` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `_QueryClass` | `Function` |
| `_schema` | [`Schema`](Schema.md)<`any`, `any`\> |
| `_additionalShape` | `string` |
| `runnerCreator` | () => [`Runner`](Runner.md)<`TInput`, `TOutput`\> |

#### Returns

[`Batcher`](Batcher.md)<`TInput`, `TOutput`\>

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:88](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L88)

___

### prewarm

▸ **prewarm**(): `void`

A convenience method to put connections prewarming logic to. The idea is to
keep the needed number of open connections and also, in each connection,
minimize the time which the very 1st query will take (e.g. pre-cache
full-text dictionaries).

#### Returns

`void`

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:130](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L130)

___

### shardNoByID

▸ `Abstract` **shardNoByID**(`id`): `number`

Extracts shard number from an ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`number`

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:116](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L116)

___

### shardNos

▸ `Abstract` **shardNos**(): `Promise`<readonly `number`[]\>

Returns all shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`<readonly `number`[]\>

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:111](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L111)

___

### withShard

▸ `Abstract` **withShard**(`no`): [`Client`](Client.md)

Creates a new Client which is namespaced to the provided shard number. The
new client will share the same connection pool with the parent's Client.

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |

#### Returns

[`Client`](Client.md)

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:122](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L122)
