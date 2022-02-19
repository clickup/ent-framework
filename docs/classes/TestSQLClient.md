[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / TestSQLClient

# Class: TestSQLClient

A proxy for an SQLClient which records all the queries
passing through and has some other helper methods.

## Hierarchy

- [`Client`](Client.md)

  ↳ **`TestSQLClient`**

## Implements

- [`SQLClient`](../interfaces/SQLClient.md)

## Constructors

### constructor

• **new TestSQLClient**(`client`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | [`SQLClient`](../interfaces/SQLClient.md) |

#### Overrides

[Client](Client.md).[constructor](Client.md#constructor)

#### Defined in

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:23](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L23)

## Properties

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

### queries

• `Readonly` **queries**: `string`[] = `[]`

#### Defined in

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:13](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L13)

## Accessors

### shardName

• `get` **shardName**(): `string`

Each Client may be bound to some shard, so the queries executed via it will
be namespaced to this shard. E.g. in PostgreSQL, shard name is schema name
(or "public" if the client wasn't created by withShard() method).

#### Returns

`string`

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[shardName](../interfaces/SQLClient.md#shardname)

#### Overrides

Client.shardName

#### Defined in

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:15](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L15)

___

### timelineManager

• `get` **timelineManager**(): [`TimelineManager`](TimelineManager.md)

Tracks the master/replica replication timeline position. Shared across all
the clients within the same island.

#### Returns

[`TimelineManager`](TimelineManager.md)

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[timelineManager](../interfaces/SQLClient.md#timelinemanager)

#### Overrides

Client.timelineManager

#### Defined in

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:19](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L19)

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

#### Inherited from

[Client](Client.md).[prewarm](Client.md#prewarm)

#### Defined in

[packages/ent-framework/src/abstract/Client.ts:130](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Client.ts#L130)

___

### query

▸ **query**<`TRes`\>(`query`, `op`, `table`, `annotations`, `batchFactor`): `Promise`<`TRes`[]\>

#### Type parameters

| Name |
| :------ |
| `TRes` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `op` | `string` |
| `table` | `string` |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| `batchFactor` | `number` |

#### Returns

`Promise`<`TRes`[]\>

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[query](../interfaces/SQLClient.md#query)

#### Defined in

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:27](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L27)

___

### resetSnapshot

▸ **resetSnapshot**(): `void`

#### Returns

`void`

#### Defined in

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:94](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L94)

___

### rows

▸ **rows**(`query`, ...`values`): `Promise`<`any`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `...values` | `any`[] |

#### Returns

`Promise`<`any`[]\>

#### Defined in

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:98](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L98)

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

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:49](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L49)

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

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:45](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L45)

___

### toMatchSnapshot

▸ **toMatchSnapshot**(): `void`

#### Returns

`void`

#### Defined in

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:57](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L57)

___

### withShard

▸ **withShard**(`no`): [`TestSQLClient`](TestSQLClient.md)

Creates a new Client which is namespaced to the provided shard number. The
new client will share the same connection pool with the parent's Client.

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |

#### Returns

[`TestSQLClient`](TestSQLClient.md)

#### Implementation of

[SQLClient](../interfaces/SQLClient.md).[withShard](../interfaces/SQLClient.md#withshard)

#### Overrides

[Client](Client.md).[withShard](Client.md#withshard)

#### Defined in

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:53](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L53)
