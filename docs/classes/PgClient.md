[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgClient

# Class: PgClient

An abstract PostgreSQL Client which doesn't know how to acquire an actual
connection and send queries; these things are up to the derived classes to
implement.

The idea is that in each particular project, people may have they own classes
derived from PgClient, in case the codebase already has some existing
connection pooling solution. They don't have to use PgClientPool.

Since the class is cloneable internally (using the prototype substitution
technique), the contract of this class is that ALL its derived classes may
only have readonly immediate properties.

## Hierarchy

- [`Client`](Client.md)

  ↳ **`PgClient`**

  ↳↳ [`PgClientPool`](PgClientPool.md)

## Constructors

### constructor

• **new PgClient**(`options`): [`PgClient`](PgClient.md)

Initializes an instance of PgClient.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`PgClientOptions`](../interfaces/PgClientOptions.md) |

#### Returns

[`PgClient`](PgClient.md)

#### Overrides

[Client](Client.md).[constructor](Client.md#constructor)

#### Defined in

[src/pg/PgClient.ts:223](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L223)

## Properties

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`\<`PickPartial`\<[`PgClientOptions`](../interfaces/PgClientOptions.md)\>\>

Default values for the constructor options.

#### Overrides

[Client](Client.md).[DEFAULT_OPTIONS](Client.md#default_options)

#### Defined in

[src/pg/PgClient.ts:169](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L169)

___

### options

• `Readonly` **options**: `Required`\<[`PgClientOptions`](../interfaces/PgClientOptions.md)\>

PgClient configuration options.

#### Overrides

[Client](Client.md).[options](Client.md#options)

#### Defined in

[src/pg/PgClient.ts:197](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L197)

___

### shardName

• `Readonly` **shardName**: `string` = `"public"`

Name of the shard associated to this Client.

#### Overrides

[Client](Client.md).[shardName](Client.md#shardname)

#### Defined in

[src/pg/PgClient.ts:200](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L200)

___

### timelineManager

• `Readonly` **timelineManager**: [`TimelineManager`](TimelineManager.md)

An active TimelineManager for this particular Client.

#### Overrides

[Client](Client.md).[timelineManager](Client.md#timelinemanager)

#### Defined in

[src/pg/PgClient.ts:203](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L203)

## Methods

### end

▸ **end**(): `Promise`\<`void`\>

Gracefully closes the connections to let the caller destroy the Client. The
pending queries are awaited to finish before returning. The Client becomes
unusable after calling this method: you should not send queries to it.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[Client](Client.md).[end](Client.md#end)

#### Defined in

[src/abstract/Client.ts:54](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L54)

___

### isEnded

▸ **isEnded**(): `boolean`

Returns true if the Client is ended and can't be used anymore.

#### Returns

`boolean`

#### Inherited from

[Client](Client.md).[isEnded](Client.md#isended)

#### Defined in

[src/abstract/Client.ts:76](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L76)

___

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

[Client](Client.md).[batcher](Client.md#batcher)

#### Defined in

[src/abstract/Client.ts:123](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L123)

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

[src/abstract/Client.ts:140](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L140)

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

[src/abstract/Client.ts:158](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L158)

___

### acquireConn

▸ **acquireConn**(): `Promise`\<[`PgClientConn`](../interfaces/PgClientConn.md)\>

Called when the Client needs a connection to run a query against.

#### Returns

`Promise`\<[`PgClientConn`](../interfaces/PgClientConn.md)\>

#### Defined in

[src/pg/PgClient.ts:208](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L208)

___

### releaseConn

▸ **releaseConn**(`conn`): `void`

Called when the Client is done with the connection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `conn` | [`PgClientConn`](../interfaces/PgClientConn.md) |

#### Returns

`void`

#### Defined in

[src/pg/PgClient.ts:213](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L213)

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

#### Defined in

[src/pg/PgClient.ts:218](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L218)

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

#### Defined in

[src/pg/PgClient.ts:269](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L269)

___

### shardNos

▸ **shardNos**(): `Promise`\<readonly `number`[]\>

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`\<readonly `number`[]\>

#### Overrides

[Client](Client.md).[shardNos](Client.md#shardnos)

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

#### Overrides

[Client](Client.md).[shardNoByID](Client.md#shardnobyid)

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

#### Overrides

[Client](Client.md).[withShard](Client.md#withshard)

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

#### Overrides

[Client](Client.md).[isMaster](Client.md#ismaster)

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

#### Overrides

[Client](Client.md).[isConnectionIssue](Client.md#isconnectionissue)

#### Defined in

[src/pg/PgClient.ts:599](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L599)
