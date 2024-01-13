[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgClientPool

# Class: PgClientPool

This class carries connection pooling logic only and delegates the rest to
PgClient base class.

The idea is that in each particular project, people may have they own classes
derived from PgClient, in case the codebase already has some existing
connection pooling solution. They don't have to use PgClientPool.

## Hierarchy

- [`PgClient`](PgClient.md)

  ↳ **`PgClientPool`**

## Constructors

### constructor

• **new PgClientPool**(`options`): [`PgClientPool`](PgClientPool.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`PgClientPoolOptions`](../interfaces/PgClientPoolOptions.md) |

#### Returns

[`PgClientPool`](PgClientPool.md)

#### Overrides

[PgClient](PgClient.md).[constructor](PgClient.md#constructor)

#### Defined in

[src/pg/PgClientPool.ts:88](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L88)

## Properties

### shardName

• `Readonly` **shardName**: `string` = `"public"`

Name of the shard associated to this Client.

#### Inherited from

[PgClient](PgClient.md).[shardName](PgClient.md#shardname)

#### Defined in

[src/pg/PgClient.ts:200](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L200)

___

### timelineManager

• `Readonly` **timelineManager**: [`TimelineManager`](TimelineManager.md)

An active TimelineManager for this particular Client.

#### Inherited from

[PgClient](PgClient.md).[timelineManager](PgClient.md#timelinemanager)

#### Defined in

[src/pg/PgClient.ts:203](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L203)

___

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`\<`PickPartial`\<[`PgClientPoolOptions`](../interfaces/PgClientPoolOptions.md)\>\>

Default values for the constructor options.

#### Overrides

[PgClient](PgClient.md).[DEFAULT_OPTIONS](PgClient.md#default_options)

#### Defined in

[src/pg/PgClientPool.ts:46](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L46)

___

### options

• `Readonly` **options**: `Required`\<[`PgClientPoolOptions`](../interfaces/PgClientPoolOptions.md)\>

PgClientPool configuration options.

#### Overrides

[PgClient](PgClient.md).[options](PgClient.md#options)

#### Defined in

[src/pg/PgClientPool.ts:69](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L69)

## Methods

### batcher

▸ **batcher**\<`TInput`, `TOutput`, `TTable`\>(`_QueryClass`, `_schema`, `_additionalShape`, `runnerCreator`): [`Batcher`](Batcher.md)\<`TInput`, `TOutput`\>

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

| Name | Type |
| :------ | :------ |
| `TInput` | `TInput` |
| `TOutput` | `TOutput` |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `_QueryClass` | `Function` |
| `_schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../modules.md#uniquekey)\<`TTable`\>\> |
| `_additionalShape` | `string` |
| `runnerCreator` | () => [`Runner`](Runner.md)\<`TInput`, `TOutput`\> |

#### Returns

[`Batcher`](Batcher.md)\<`TInput`, `TOutput`\>

#### Inherited from

[PgClient](PgClient.md).[batcher](PgClient.md#batcher)

#### Defined in

[src/abstract/Client.ts:123](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L123)

___

### query

▸ **query**\<`TRow`\>(`«destructured»`): `Promise`\<`TRow`[]\>

Sends a query (internally, a multi-query). After the query finishes, we
should expect that isMaster() returns the actual master/replica role.

#### Type parameters

| Name |
| :------ |
| `TRow` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `query` | [`Literal`](../modules.md#literal) |
| › `hints?` | `Record`\<`string`, `string`\> |
| › `isWrite` | `boolean` |
| › `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| › `op` | `string` |
| › `table` | `string` |
| › `batchFactor?` | `number` |

#### Returns

`Promise`\<`TRow`[]\>

#### Inherited from

[PgClient](PgClient.md).[query](PgClient.md#query)

#### Defined in

[src/pg/PgClient.ts:269](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L269)

___

### shardNos

▸ **shardNos**(): `Promise`\<readonly `number`[]\>

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`\<readonly `number`[]\>

#### Inherited from

[PgClient](PgClient.md).[shardNos](PgClient.md#shardnos)

#### Defined in

[src/pg/PgClient.ts:504](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L504)

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

#### Inherited from

[PgClient](PgClient.md).[shardNoByID](PgClient.md#shardnobyid)

#### Defined in

[src/pg/PgClient.ts:528](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L528)

___

### withShard

▸ **withShard**(`no`): `this`

Creates a new Client which is namespaced to the provided Shard number. The
new Client will share the same connection pool with the parent's Client.

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |

#### Returns

`this`

#### Inherited from

[PgClient](PgClient.md).[withShard](PgClient.md#withshard)

#### Defined in

[src/pg/PgClient.ts:584](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L584)

___

### isMaster

▸ **isMaster**(): `boolean`

Returns true if, after the last query, the Client reported being a master
node. Master and replica roles may switch online unpredictably, without
reconnecting, so we only know the role after a query.

#### Returns

`boolean`

#### Inherited from

[PgClient](PgClient.md).[isMaster](PgClient.md#ismaster)

#### Defined in

[src/pg/PgClient.ts:595](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L595)

___

### isConnectionIssue

▸ **isConnectionIssue**(): `boolean`

Returns true if the Client couldn't connect to the server (or it could, but
the load balancer reported the remote server as not working), so it should
ideally be removed from the list of active replicas until e.g. the next
discovery query to it (or any query) succeeds.

#### Returns

`boolean`

#### Inherited from

[PgClient](PgClient.md).[isConnectionIssue](PgClient.md#isconnectionissue)

#### Defined in

[src/pg/PgClient.ts:599](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L599)

___

### acquireConn

▸ **acquireConn**(): `Promise`\<[`PgClientPoolConn`](../modules.md#pgclientpoolconn)\>

Called when the Client needs a connection to run a query against.

#### Returns

`Promise`\<[`PgClientPoolConn`](../modules.md#pgclientpoolconn)\>

#### Overrides

[PgClient](PgClient.md).[acquireConn](PgClient.md#acquireconn)

#### Defined in

[src/pg/PgClientPool.ts:71](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L71)

___

### releaseConn

▸ **releaseConn**(`conn`): `void`

Called when the Client is done with the connection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `conn` | [`PgClientPoolConn`](../modules.md#pgclientpoolconn) |

#### Returns

`void`

#### Overrides

[PgClient](PgClient.md).[releaseConn](PgClient.md#releaseconn)

#### Defined in

[src/pg/PgClientPool.ts:75](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L75)

___

### poolStats

▸ **poolStats**(): `Object`

Returns statistics about the connection pool.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `totalCount` | `number` |
| `waitingCount` | `number` |
| `idleCount` | `number` |

#### Overrides

[PgClient](PgClient.md).[poolStats](PgClient.md#poolstats)

#### Defined in

[src/pg/PgClientPool.ts:80](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L80)

___

### logSwallowedError

▸ **logSwallowedError**(`where`, `e`, `elapsed`): `void`

Calls swallowedErrorLogger() doing some preliminary amendment.

#### Parameters

| Name | Type |
| :------ | :------ |
| `where` | `string` |
| `e` | `unknown` |
| `elapsed` | ``null`` \| `number` |

#### Returns

`void`

#### Overrides

[PgClient](PgClient.md).[logSwallowedError](PgClient.md#logswallowederror)

#### Defined in

[src/pg/PgClientPool.ts:120](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L120)

___

### end

▸ **end**(): `Promise`\<`void`\>

Gracefully closes the connections to let the caller destroy the Client. The
pending queries are awaited to finish before returning. The Client becomes
unusable after calling this method: you should not send queries to it.

#### Returns

`Promise`\<`void`\>

#### Overrides

[PgClient](PgClient.md).[end](PgClient.md#end)

#### Defined in

[src/pg/PgClientPool.ts:130](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L130)

___

### isEnded

▸ **isEnded**(): `boolean`

Returns true if the Client is ended and can't be used anymore.

#### Returns

`boolean`

#### Overrides

[PgClient](PgClient.md).[isEnded](PgClient.md#isended)

#### Defined in

[src/pg/PgClientPool.ts:141](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L141)

___

### prewarm

▸ **prewarm**(): `void`

A convenience method to put connections prewarming logic to. The idea is to
keep the needed number of open connections and also, in each connection,
minimize the time which the very 1st query will take (e.g. pre-cache
full-text dictionaries).

#### Returns

`void`

#### Overrides

[PgClient](PgClient.md).[prewarm](PgClient.md#prewarm)

#### Defined in

[src/pg/PgClientPool.ts:145](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L145)
