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

• **new SQLClient**(`options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`SQLClientOptions`](../interfaces/SQLClientOptions.md) |

#### Overrides

[Client](Client.md).[constructor](Client.md#constructor)

#### Defined in

[src/sql/SQLClient.ts:104](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L104)

## Properties

### options

• `Readonly` **options**: `Required`<[`SQLClientOptions`](../interfaces/SQLClientOptions.md)\>

SQLClient configuration options.

#### Overrides

[Client](Client.md).[options](Client.md#options)

#### Defined in

[src/sql/SQLClient.ts:77](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L77)

___

### shardName

• `Readonly` **shardName**: `string` = `"public"`

Name of the shard associated to this Client.

#### Overrides

[Client](Client.md).[shardName](Client.md#shardname)

#### Defined in

[src/sql/SQLClient.ts:80](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L80)

___

### timelineManager

• `Readonly` **timelineManager**: [`TimelineManager`](TimelineManager.md)

An active TimelineManager for this particular Client.

#### Overrides

[Client](Client.md).[timelineManager](Client.md#timelinemanager)

#### Defined in

[src/sql/SQLClient.ts:83](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L83)

___

### cnt

• `Readonly` **cnt**: `number`

#### Defined in

[src/sql/SQLClient.ts:96](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L96)

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

[src/abstract/Client.ts:47](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L47)

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

[src/abstract/Client.ts:105](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L105)

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

[src/abstract/Client.ts:126](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L126)

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

[src/abstract/Client.ts:144](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L144)

___

### acquireConn

▸ `Protected` `Abstract` **acquireConn**(): `Promise`<[`SQLClientConn`](../interfaces/SQLClientConn.md)\>

#### Returns

`Promise`<[`SQLClientConn`](../interfaces/SQLClientConn.md)\>

#### Defined in

[src/sql/SQLClient.ts:98](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L98)

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

[src/sql/SQLClient.ts:100](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L100)

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

[src/sql/SQLClient.ts:102](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L102)

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

#### Defined in

[src/sql/SQLClient.ts:128](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L128)

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

#### Overrides

[Client](Client.md).[shardNoByID](Client.md#shardnobyid)

#### Defined in

[src/sql/SQLClient.ts:342](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L342)

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

[src/sql/SQLClient.ts:399](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L399)

___

### isMaster

▸ **isMaster**(): `boolean`

Returns true if, after the last query, the Client reported being a master
node. Master and replica roles may switch online unpredictably, without
reconnecting, so we only know the role after a query.

#### Returns

`boolean`

#### Overrides

[Client](Client.md).[isMaster](Client.md#ismaster)

#### Defined in

[src/sql/SQLClient.ts:408](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L408)
