[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientPool

# Class: SQLClientPool

## Hierarchy

- [`Client`](Client.md)

  ↳ **`SQLClientPool`**

## Implements

- [`SQLClient`](../interfaces/SQLClient.md)

## Constructors

### constructor

• **new SQLClientPool**(`dest`, `loggers`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `dest` | [`SQLClientDest`](../interfaces/SQLClientDest.md) |
| `loggers` | [`Loggers`](../interfaces/Loggers.md) |

#### Overrides

[Client](Client.md).[constructor](Client.md#constructor)

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:64](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L64)

## Properties

### dest

• `Readonly` **dest**: [`SQLClientDest`](../interfaces/SQLClientDest.md)

___

### isMaster

• `Readonly` **isMaster**: `boolean`

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[isMaster](../interfaces/SQLClient.md#ismaster)

#### Inherited from

[Client](Client.md).[isMaster](Client.md#ismaster)

___

### loggers

• `Readonly` **loggers**: [`Loggers`](../interfaces/Loggers.md)

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[loggers](../interfaces/SQLClient.md#loggers)

#### Inherited from

[Client](Client.md).[loggers](Client.md#loggers)

___

### name

• `Readonly` **name**: `string`

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[name](../interfaces/SQLClient.md#name)

#### Inherited from

[Client](Client.md).[name](Client.md#name)

___

### shardName

• `Readonly` **shardName**: ``"public"``

Each Client may be bound to some shard, so the queries executed via it will
be namespaced to this shard. E.g. in PostgreSQL, shard name is schema name
(or "public" if the client wasn't created by withShard() method).

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[shardName](../interfaces/SQLClient.md#shardname)

#### Overrides

[Client](Client.md).[shardName](Client.md#shardname)

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:46](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L46)

___

### timelineManager

• `Readonly` **timelineManager**: [`TimelineManager`](TimelineManager.md)

Tracks the master/replica replication timeline position. Shared across all
the clients within the same island.

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[timelineManager](../interfaces/SQLClient.md#timelinemanager)

#### Overrides

[Client](Client.md).[timelineManager](Client.md#timelinemanager)

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:48](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L48)

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

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[batcher](../interfaces/SQLClient.md#batcher)

#### Inherited from

[Client](Client.md).[batcher](Client.md#batcher)

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

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[prewarm](../interfaces/SQLClient.md#prewarm)

#### Overrides

[Client](Client.md).[prewarm](Client.md#prewarm)

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:274](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L274)

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
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| `batchFactor` | `number` |

#### Returns

`Promise`<`TRow`[]\>

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[query](../interfaces/SQLClient.md#query)

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:92](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L92)

___

### shardNoByID

▸ **shardNoByID**(`id`): `number`

Extracts shard number from an ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`number`

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[shardNoByID](../interfaces/SQLClient.md#shardnobyid)

#### Overrides

[Client](Client.md).[shardNoByID](Client.md#shardnobyid)

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:247](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L247)

___

### shardNos

▸ **shardNos**(): `Promise`<readonly `number`[]\>

Returns all shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`<readonly `number`[]\>

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[shardNos](../interfaces/SQLClient.md#shardnos)

#### Overrides

[Client](Client.md).[shardNos](Client.md#shardnos)

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:218](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L218)

___

### withShard

▸ **withShard**(`no`): [`SQLClientPool`](SQLClientPool.md)

Creates a new Client which is namespaced to the provided shard number. The
new client will share the same connection pool with the parent's Client.

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |

#### Returns

[`SQLClientPool`](SQLClientPool.md)

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[withShard](../interfaces/SQLClient.md#withshard)

#### Overrides

[Client](Client.md).[withShard](Client.md#withshard)

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:265](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L265)
