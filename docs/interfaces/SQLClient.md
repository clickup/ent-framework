[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SQLClient

# Interface: SQLClient

## Hierarchy

- [`Client`](../classes/Client.md)

  ↳ **`SQLClient`**

## Implemented by

- [`SQLClientPool`](../classes/SQLClientPool.md)
- [`TestSQLClient`](../classes/TestSQLClient.md)

## Properties

### isMaster

• `Readonly` **isMaster**: `boolean`

#### Inherited from

[Client](../classes/Client.md).[isMaster](../classes/Client.md#ismaster)

___

### loggers

• `Readonly` **loggers**: [`Loggers`](Loggers.md)

#### Inherited from

[Client](../classes/Client.md).[loggers](../classes/Client.md#loggers)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[Client](../classes/Client.md).[name](../classes/Client.md#name)

___

### shardName

• `Readonly` `Abstract` **shardName**: `string`

Each Client may be bound to some shard, so the queries executed via it will
be namespaced to this shard. E.g. in PostgreSQL, shard name is schema name
(or "public" if the client wasn't created by withShard() method).

#### Inherited from

[Client](../classes/Client.md).[shardName](../classes/Client.md#shardname)

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:51](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L51)

___

### timelineManager

• `Readonly` `Abstract` **timelineManager**: [`TimelineManager`](../classes/TimelineManager.md)

Tracks the master/replica replication timeline position. Shared across all
the clients within the same island.

#### Inherited from

[Client](../classes/Client.md).[timelineManager](../classes/Client.md#timelinemanager)

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:57](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L57)

## Methods

### batcher

▸ **batcher**<`TInput`, `TOutput`\>(`_QueryClass`, `_schema`, `_additionalShape`, `runnerCreator`): [`Batcher`](../classes/Batcher.md)<`TInput`, `TOutput`\>

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
| `_schema` | [`Schema`](../classes/Schema.md)<`any`, `any`\> |
| `_additionalShape` | `string` |
| `runnerCreator` | () => [`Runner`](../classes/Runner.md)<`TInput`, `TOutput`\> |

#### Returns

[`Batcher`](../classes/Batcher.md)<`TInput`, `TOutput`\>

#### Inherited from

[Client](../classes/Client.md).[batcher](../classes/Client.md#batcher)

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

#### Inherited from

[Client](../classes/Client.md).[prewarm](../classes/Client.md#prewarm)

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:130](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L130)

___

### query

▸ **query**<`TRow`\>(`query`, `op`, `table`, `annotations`, `batchFactor`): `Promise`<`TRow`[]\>

#### Type parameters

| Name |
| :------ |
| `TRow` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` \| { `hints`: `Record`<`string`, `string`\> ; `query`: `string`  } |
| `op` | `string` |
| `table` | `string` |
| `annotations` | [`QueryAnnotation`](QueryAnnotation.md)[] |
| `batchFactor` | `number` |

#### Returns

`Promise`<`TRow`[]\>

#### Defined in

[packages/ent-framework/src/sql/SQLClient.ts:82](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClient.ts#L82)

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

#### Inherited from

[Client](../classes/Client.md).[shardNoByID](../classes/Client.md#shardnobyid)

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:116](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L116)

___

### shardNos

▸ `Abstract` **shardNos**(): `Promise`<readonly `number`[]\>

Returns all shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`<readonly `number`[]\>

#### Inherited from

[Client](../classes/Client.md).[shardNos](../classes/Client.md#shardnos)

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:111](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L111)

___

### withShard

▸ `Abstract` **withShard**(`no`): [`SQLClient`](SQLClient.md)

Creates a new Client which is namespaced to the provided shard number. The
new client will share the same connection pool with the parent's Client.

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |

#### Returns

[`SQLClient`](SQLClient.md)

#### Inherited from

[Client](../classes/Client.md).[withShard](../classes/Client.md#withshard)

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:122](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L122)
