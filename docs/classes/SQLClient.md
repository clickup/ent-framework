[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLClient

# Class: SQLClient

An abstract PostgreSQL Client which doesn't know how to acquire an actual
connection and send queries; these things are up to the derived classes to
implement.

The idea is that in each particular project, people may have they own classes
derived from SQLClient, in case the codebase already has some existing
connection pooling solution. They don't have to use SQLClientPool.

Since the class is cloneable internally (using the prototype substitution
technique), the contract of this class is that ALL its derived classes may
only have readonly immediate properties.

## Hierarchy

- [`Client`](Client.md)

  ↳ **`SQLClient`**

  ↳↳ [`SQLClientPool`](SQLClientPool.md)

## Constructors

### constructor

• **new SQLClient**(`options`)

Initializes an instance of SQLClient.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`SQLClientOptions`](../interfaces/SQLClientOptions.md) |

#### Overrides

[Client](Client.md).[constructor](Client.md#constructor)

#### Defined in

[src/sql/SQLClient.ts:224](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L224)

## Properties

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`<[`PickPartial`](../modules.md#pickpartial)<[`SQLClientOptions`](../interfaces/SQLClientOptions.md)\>\>

Default values for the constructor options.

#### Overrides

[Client](Client.md).[DEFAULT_OPTIONS](Client.md#default_options)

#### Defined in

[src/sql/SQLClient.ts:170](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L170)

___

### options

• `Readonly` **options**: `Required`<[`SQLClientOptions`](../interfaces/SQLClientOptions.md)\>

SQLClient configuration options.

#### Overrides

[Client](Client.md).[options](Client.md#options)

#### Defined in

[src/sql/SQLClient.ts:198](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L198)

___

### shardName

• `Readonly` **shardName**: `string` = `"public"`

Name of the shard associated to this Client.

#### Overrides

[Client](Client.md).[shardName](Client.md#shardname)

#### Defined in

[src/sql/SQLClient.ts:201](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L201)

___

### timelineManager

• `Readonly` **timelineManager**: [`TimelineManager`](TimelineManager.md)

An active TimelineManager for this particular Client.

#### Overrides

[Client](Client.md).[timelineManager](Client.md#timelinemanager)

#### Defined in

[src/sql/SQLClient.ts:204](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L204)

## Methods

### end

▸ `Abstract` **end**(): `Promise`<`void`\>

Gracefully closes the connections to let the caller destroy the Client. The
pending queries are awaited to finish before returning. The Client becomes
unusable after calling this method: you should not send queries to it.

#### Returns

`Promise`<`void`\>

#### Inherited from

[Client](Client.md).[end](Client.md#end)

#### Defined in

[src/abstract/Client.ts:53](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L53)

___

### isEnded

▸ `Abstract` **isEnded**(): `boolean`

Returns true if the Client is ended and can't be used anymore.

#### Returns

`boolean`

#### Inherited from

[Client](Client.md).[isEnded](Client.md#isended)

#### Defined in

[src/abstract/Client.ts:75](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L75)

___

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

[Client](Client.md).[batcher](Client.md#batcher)

#### Defined in

[src/abstract/Client.ts:122](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L122)

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

[src/abstract/Client.ts:139](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L139)

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

[src/abstract/Client.ts:157](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L157)

___

### acquireConn

▸ `Protected` `Abstract` **acquireConn**(): `Promise`<[`SQLClientConn`](../interfaces/SQLClientConn.md)\>

Called when the Client needs a connection to run a query against.

#### Returns

`Promise`<[`SQLClientConn`](../interfaces/SQLClientConn.md)\>

#### Defined in

[src/sql/SQLClient.ts:209](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L209)

___

### releaseConn

▸ `Protected` `Abstract` **releaseConn**(`conn`): `void`

Called when the Client is done with the connection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `conn` | [`SQLClientConn`](../interfaces/SQLClientConn.md) |

#### Returns

`void`

#### Defined in

[src/sql/SQLClient.ts:214](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L214)

___

### poolStats

▸ `Protected` `Abstract` **poolStats**(): `Object`

Returns statistics about the connection pool.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `totalCount` | `number` |
| `waitingCount` | `number` |
| `idleCount` | `number` |

#### Defined in

[src/sql/SQLClient.ts:219](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L219)

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

[src/sql/SQLClient.ts:270](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L270)

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

#### Overrides

[Client](Client.md).[shardNoByID](Client.md#shardnobyid)

#### Defined in

[src/sql/SQLClient.ts:529](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L529)

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

[src/sql/SQLClient.ts:585](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L585)

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

#### Overrides

[Client](Client.md).[isConnectionIssue](Client.md#isconnectionissue)

#### Defined in

[src/sql/SQLClient.ts:600](https://github.com/clickup/ent-framework/blob/master/src/sql/SQLClient.ts#L600)
