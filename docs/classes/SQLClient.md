[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLClient

# Class: SQLClient

An abstract PostgreSQL Client which doesn't know how to acquire an actual
connection and send queries; these things are up to the derived classes to
implement.

## Hierarchy

- [`Client`](Client.md)

  ↳ **`SQLClient`**

  ↳↳ [`SQLClientPool`](SQLClientPool.md)

## Constructors

### constructor

• **new SQLClient**(`name`, `isMaster`, `loggers`, `hints?`, `shards?`, `maxReplicationLagMs?`, `batchDelayMs?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `isMaster` | `boolean` |
| `loggers` | [`Loggers`](../interfaces/Loggers.md) |
| `hints?` | `Record`<`string`, `string`\> |
| `shards?` | `Object` |
| `shards.nameFormat` | `string` |
| `shards.discoverQuery` | `string` |
| `maxReplicationLagMs?` | `number` |
| `batchDelayMs?` | `number` \| () => `number` |

#### Overrides

[Client](Client.md).[constructor](Client.md#constructor)

#### Defined in

[src/sql/SQLClient.ts:60](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L60)

## Properties

### name

• `Readonly` **name**: `string`

#### Inherited from

[Client](Client.md).[name](Client.md#name)

#### Defined in

[src/abstract/Client.ts:52](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L52)

___

### isMaster

• `Readonly` **isMaster**: `boolean`

#### Inherited from

[Client](Client.md).[isMaster](Client.md#ismaster)

#### Defined in

[src/abstract/Client.ts:53](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L53)

___

### loggers

• `Readonly` **loggers**: [`Loggers`](../interfaces/Loggers.md)

#### Inherited from

[Client](Client.md).[loggers](Client.md#loggers)

#### Defined in

[src/abstract/Client.ts:54](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L54)

___

### shardName

• `Readonly` **shardName**: `string` = `"public"`

Each Client may be bound to some Shard, so the queries executed via it will
be namespaced to this Shard. E.g. in PostgreSQL, Shard name is schema name
(or "public" if the Client wasn't created by withShard() method).

#### Overrides

[Client](Client.md).[shardName](Client.md#shardname)

#### Defined in

[src/sql/SQLClient.ts:39](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L39)

___

### timelineManager

• `Readonly` **timelineManager**: [`TimelineManager`](TimelineManager.md)

Tracks the master/replica replication timeline position. Shared across all
the Clients within the same Island.

#### Overrides

[Client](Client.md).[timelineManager](Client.md#timelinemanager)

#### Defined in

[src/sql/SQLClient.ts:41](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L41)

## Methods

### end

▸ `Abstract` **end**(`forceDisconnect?`): `Promise`<`void`\>

Closes the connections to let the caller destroy the Client. By default,
the pending queries are awaited to finish before returning, but if you pass
forceDisconnect, all of the connections will be closed immediately.

#### Parameters

| Name | Type |
| :------ | :------ |
| `forceDisconnect?` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Inherited from

[Client](Client.md).[end](Client.md#end)

#### Defined in

[src/abstract/Client.ts:32](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L32)

___

### batcher

▸ **batcher**<`TInput`, `TOutput`\>(`_QueryClass`, `_schema`, `_additionalShape`, `runnerCreator`): [`Batcher`](Batcher.md)<`TInput`, `TOutput`\>

Batcher is per-Client per-query-type per-table-name-and-shape:
- Per-Client means that batchers are removed as soon as the Client is
  removed, i.e. the Client owns all the batchers for all tables.
- Per-query-type means that the batcher for a SELECT query is different
  from the batcher for an INSERT query (obviously).
- Per-table-name-and-shape means that each table has its own set of
  batchers (obviously). Also, some queries may be complex (like UPDATE), so
  the batcher also depends on the "shape" - the list of fields we're
  updating.

Also, for every Batcher, there is exactly one Runner (which knows how to
build the actual query in the context of the current Client). Batchers are
generic (like DataLoader, but more general), and Runners are very custom to
the query (and are private to these queries).

All that means that in a 1000-Shard 20-table Cluster we'll eventually have
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

#### Inherited from

[Client](Client.md).[batcher](Client.md#batcher)

#### Defined in

[src/abstract/Client.ts:81](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L81)

___

### logSwallowedError

▸ **logSwallowedError**(`where`, `error`, `elapsed`): `void`

Calls swallowedErrorLogger() doing some preliminary amendment.

#### Parameters

| Name | Type |
| :------ | :------ |
| `where` | `string` |
| `error` | `unknown` |
| `elapsed` | ``null`` \| `number` |

#### Returns

`void`

#### Inherited from

[Client](Client.md).[logSwallowedError](Client.md#logswallowederror)

#### Defined in

[src/abstract/Client.ts:102](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L102)

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

[Client](Client.md).[prewarm](Client.md#prewarm)

#### Defined in

[src/abstract/Client.ts:120](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L120)

___

### acquireConn

▸ `Protected` `Abstract` **acquireConn**(): `Promise`<[`SQLClientConn`](../interfaces/SQLClientConn.md)\>

#### Returns

`Promise`<[`SQLClientConn`](../interfaces/SQLClientConn.md)\>

#### Defined in

[src/sql/SQLClient.ts:54](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L54)

___

### releaseConn

▸ `Protected` `Abstract` **releaseConn**(`conn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `conn` | [`SQLClientConn`](../interfaces/SQLClientConn.md) |

#### Returns

`void`

#### Defined in

[src/sql/SQLClient.ts:56](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L56)

___

### poolStats

▸ `Protected` `Abstract` **poolStats**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `totalCount` | `number` |
| `waitingCount` | `number` |
| `idleCount` | `number` |

#### Defined in

[src/sql/SQLClient.ts:58](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L58)

___

### query

▸ **query**<`TRow`\>(`«destructured»`): `Promise`<`TRow`[]\>

#### Type parameters

| Name |
| :------ |
| `TRow` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `query` | [`Literal`](../modules.md#literal) |
| › `hints?` | `Record`<`string`, `string`\> |
| › `isWrite` | `boolean` |
| › `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| › `op` | `string` |
| › `table` | `string` |
| › `batchFactor?` | `number` |

#### Returns

`Promise`<`TRow`[]\>

#### Defined in

[src/sql/SQLClient.ts:85](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L85)

___

### shardNos

▸ **shardNos**(): `Promise`<readonly `number`[]\>

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`<readonly `number`[]\>

#### Overrides

[Client](Client.md).[shardNos](Client.md#shardnos)

#### Defined in

[src/sql/SQLClient.ts:269](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L269)

___

### shardNoByID

▸ **shardNoByID**(`id`): `number`

Extracts Shard number from an ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`number`

#### Overrides

[Client](Client.md).[shardNoByID](Client.md#shardnobyid)

#### Defined in

[src/sql/SQLClient.ts:293](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L293)

___

### withShard

▸ **withShard**(`no`): [`SQLClient`](SQLClient.md)

Creates a new Client which is namespaced to the provided Shard number. The
new Client will share the same connection pool with the parent's Client.

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |

#### Returns

[`SQLClient`](SQLClient.md)

#### Overrides

[Client](Client.md).[withShard](Client.md#withshard)

#### Defined in

[src/sql/SQLClient.ts:350](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L350)
