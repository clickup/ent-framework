[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientPool

# Class: SQLClientPool

This class carries connection pooling logic only and delegates the rest to
SQLClient base class.

The idea is that in each particular project, people may have they own classes
derived from SQLClient, in case the codebase already has some existing
connection pooling solution. They don't have to use SQLClientPool.

## Hierarchy

- [`SQLClient`](SQLClient.md)

  ↳ **`SQLClientPool`**

## Constructors

### constructor

• **new SQLClientPool**(`options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`SQLClientPoolOptions`](../interfaces/SQLClientPoolOptions.md) |

#### Overrides

[SQLClient](SQLClient.md).[constructor](SQLClient.md#constructor)

#### Defined in

[src/sql/SQLClientPool.ts:88](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L88)

## Properties

### shardName

• `Readonly` **shardName**: `string` = `"public"`

Name of the shard associated to this Client.

#### Inherited from

[SQLClient](SQLClient.md).[shardName](SQLClient.md#shardname)

#### Defined in

[src/sql/SQLClient.ts:201](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L201)

___

### timelineManager

• `Readonly` **timelineManager**: [`TimelineManager`](TimelineManager.md)

An active TimelineManager for this particular Client.

#### Inherited from

[SQLClient](SQLClient.md).[timelineManager](SQLClient.md#timelinemanager)

#### Defined in

[src/sql/SQLClient.ts:204](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L204)

___

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`<[`PickPartial`](../modules.md#pickpartial)<[`SQLClientPoolOptions`](../interfaces/SQLClientPoolOptions.md)\>\>

Default values for the constructor options.

#### Overrides

[SQLClient](SQLClient.md).[DEFAULT_OPTIONS](SQLClient.md#default_options)

#### Defined in

[src/sql/SQLClientPool.ts:46](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L46)

___

### options

• `Readonly` **options**: `Required`<[`SQLClientPoolOptions`](../interfaces/SQLClientPoolOptions.md)\>

SQLClientPool configuration options.

#### Overrides

[SQLClient](SQLClient.md).[options](SQLClient.md#options)

#### Defined in

[src/sql/SQLClientPool.ts:69](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L69)

## Methods

### batcher

▸ **batcher**<`TInput`, `TOutput`, `TTable`\>(`_QueryClass`, `_schema`, `_additionalShape`, `runnerCreator`): [`Batcher`](Batcher.md)<`TInput`, `TOutput`\>

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
| `_schema` | [`Schema`](Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\> |
| `_additionalShape` | `string` |
| `runnerCreator` | () => [`Runner`](Runner.md)<`TInput`, `TOutput`\> |

#### Returns

[`Batcher`](Batcher.md)<`TInput`, `TOutput`\>

#### Inherited from

[SQLClient](SQLClient.md).[batcher](SQLClient.md#batcher)

#### Defined in

[src/abstract/Client.ts:122](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L122)

___

### query

▸ **query**<`TRow`\>(`«destructured»`): `Promise`<`TRow`[]\>

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
| › `hints?` | `Record`<`string`, `string`\> |
| › `isWrite` | `boolean` |
| › `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| › `op` | `string` |
| › `table` | `string` |
| › `batchFactor?` | `number` |

#### Returns

`Promise`<`TRow`[]\>

#### Inherited from

[SQLClient](SQLClient.md).[query](SQLClient.md#query)

#### Defined in

[src/sql/SQLClient.ts:270](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L270)

___

### shardNos

▸ **shardNos**(): `Promise`<readonly `number`[]\>

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`<readonly `number`[]\>

#### Inherited from

[SQLClient](SQLClient.md).[shardNos](SQLClient.md#shardnos)

#### Defined in

[src/sql/SQLClient.ts:505](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L505)

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

[SQLClient](SQLClient.md).[shardNoByID](SQLClient.md#shardnobyid)

#### Defined in

[src/sql/SQLClient.ts:529](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L529)

___

### withShard

▸ **withShard**(`no`): [`SQLClientPool`](SQLClientPool.md)

Creates a new Client which is namespaced to the provided Shard number. The
new Client will share the same connection pool with the parent's Client.

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |

#### Returns

[`SQLClientPool`](SQLClientPool.md)

#### Inherited from

[SQLClient](SQLClient.md).[withShard](SQLClient.md#withshard)

#### Defined in

[src/sql/SQLClient.ts:585](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L585)

___

### isMaster

▸ **isMaster**(): `boolean`

Returns true if, after the last query, the Client reported being a master
node. Master and replica roles may switch online unpredictably, without
reconnecting, so we only know the role after a query.

#### Returns

`boolean`

#### Inherited from

[SQLClient](SQLClient.md).[isMaster](SQLClient.md#ismaster)

#### Defined in

[src/sql/SQLClient.ts:596](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L596)

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

[SQLClient](SQLClient.md).[isConnectionIssue](SQLClient.md#isconnectionissue)

#### Defined in

[src/sql/SQLClient.ts:600](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L600)

___

### acquireConn

▸ `Protected` **acquireConn**(): `Promise`<[`SQLClientPoolConn`](../modules.md#sqlclientpoolconn)\>

Called when the Client needs a connection to run a query against.

#### Returns

`Promise`<[`SQLClientPoolConn`](../modules.md#sqlclientpoolconn)\>

#### Overrides

[SQLClient](SQLClient.md).[acquireConn](SQLClient.md#acquireconn)

#### Defined in

[src/sql/SQLClientPool.ts:71](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L71)

___

### releaseConn

▸ `Protected` **releaseConn**(`conn`): `void`

Called when the Client is done with the connection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `conn` | [`SQLClientPoolConn`](../modules.md#sqlclientpoolconn) |

#### Returns

`void`

#### Overrides

[SQLClient](SQLClient.md).[releaseConn](SQLClient.md#releaseconn)

#### Defined in

[src/sql/SQLClientPool.ts:75](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L75)

___

### poolStats

▸ `Protected` **poolStats**(): `Object`

Returns statistics about the connection pool.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `totalCount` | `number` |
| `waitingCount` | `number` |
| `idleCount` | `number` |

#### Overrides

[SQLClient](SQLClient.md).[poolStats](SQLClient.md#poolstats)

#### Defined in

[src/sql/SQLClientPool.ts:80](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L80)

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

[SQLClient](SQLClient.md).[logSwallowedError](SQLClient.md#logswallowederror)

#### Defined in

[src/sql/SQLClientPool.ts:120](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L120)

___

### end

▸ **end**(): `Promise`<`void`\>

Gracefully closes the connections to let the caller destroy the Client. The
pending queries are awaited to finish before returning. The Client becomes
unusable after calling this method: you should not send queries to it.

#### Returns

`Promise`<`void`\>

#### Overrides

[SQLClient](SQLClient.md).[end](SQLClient.md#end)

#### Defined in

[src/sql/SQLClientPool.ts:130](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L130)

___

### isEnded

▸ **isEnded**(): `boolean`

Returns true if the Client is ended and can't be used anymore.

#### Returns

`boolean`

#### Overrides

[SQLClient](SQLClient.md).[isEnded](SQLClient.md#isended)

#### Defined in

[src/sql/SQLClientPool.ts:141](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L141)

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

[SQLClient](SQLClient.md).[prewarm](SQLClient.md#prewarm)

#### Defined in

[src/sql/SQLClientPool.ts:145](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClientPool.ts#L145)
