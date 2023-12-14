[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientPool

# Class: SQLClientPool

An abstract PostgreSQL Client which doesn't know how to acquire an actual
connection and send queries; these things are up to the derived classes to
implement.

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

[src/sql/SQLClientPool.ts:68](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L68)

## Properties

### shardName

• `Readonly` **shardName**: `string` = `"public"`

Name of the shard associated to this Client.

#### Inherited from

[SQLClient](SQLClient.md).[shardName](SQLClient.md#shardname)

#### Defined in

[src/sql/SQLClient.ts:80](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L80)

___

### timelineManager

• `Readonly` **timelineManager**: [`TimelineManager`](TimelineManager.md)

An active TimelineManager for this particular Client.

#### Inherited from

[SQLClient](SQLClient.md).[timelineManager](SQLClient.md#timelinemanager)

#### Defined in

[src/sql/SQLClient.ts:83](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L83)

___

### cnt

• `Readonly` **cnt**: `number`

#### Inherited from

[SQLClient](SQLClient.md).[cnt](SQLClient.md#cnt)

#### Defined in

[src/sql/SQLClient.ts:96](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L96)

___

### options

• `Readonly` **options**: `Required`<[`SQLClientPoolOptions`](../interfaces/SQLClientPoolOptions.md)\>

SQLClient configuration options.

#### Overrides

[SQLClient](SQLClient.md).[options](SQLClient.md#options)

#### Defined in

[src/sql/SQLClientPool.ts:49](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L49)

## Methods

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

[SQLClient](SQLClient.md).[batcher](SQLClient.md#batcher)

#### Defined in

[src/abstract/Client.ts:105](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L105)

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

[src/sql/SQLClient.ts:128](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L128)

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

[src/sql/SQLClient.ts:318](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L318)

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

[src/sql/SQLClient.ts:342](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L342)

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

[src/sql/SQLClient.ts:399](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L399)

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

[src/sql/SQLClient.ts:408](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L408)

___

### acquireConn

▸ `Protected` **acquireConn**(): `Promise`<`PoolClient`\>

#### Returns

`Promise`<`PoolClient`\>

#### Overrides

[SQLClient](SQLClient.md).[acquireConn](SQLClient.md#acquireconn)

#### Defined in

[src/sql/SQLClientPool.ts:51](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L51)

___

### releaseConn

▸ `Protected` **releaseConn**(`conn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `conn` | [`SQLClientPoolClient`](../modules.md#sqlclientpoolclient) |

#### Returns

`void`

#### Overrides

[SQLClient](SQLClient.md).[releaseConn](SQLClient.md#releaseconn)

#### Defined in

[src/sql/SQLClientPool.ts:55](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L55)

___

### poolStats

▸ `Protected` **poolStats**(): `Object`

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

[src/sql/SQLClientPool.ts:60](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L60)

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

[src/sql/SQLClientPool.ts:116](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L116)

___

### end

▸ **end**(`forceDisconnect?`): `Promise`<`void`\>

Closes the connections to let the caller destroy the Client. By default,
the pending queries are awaited to finish before returning, but if you pass
forceDisconnect, all of the connections will be closed immediately.

#### Parameters

| Name | Type |
| :------ | :------ |
| `forceDisconnect?` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Overrides

[SQLClient](SQLClient.md).[end](SQLClient.md#end)

#### Defined in

[src/sql/SQLClientPool.ts:126](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L126)

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

[src/sql/SQLClientPool.ts:143](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L143)
