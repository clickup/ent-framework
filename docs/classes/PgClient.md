[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / PgClient

# Class: `abstract` PgClient

An abstract PostgreSQL Client which doesn't know how to acquire an actual
connection and send queries; these things are up to the derived classes to
implement.

The idea is that in each particular project, people may have they own classes
derived from PgClient, in case the codebase already has some existing
connection pooling solution. They don't have to use PgClientPool.

Since the class is cloneable internally (using the prototype substitution
technique), the contract of this class is that ALL its derived classes may
only have readonly immediate properties.

## Extends

- [`Client`](Client.md)

## Extended by

- [`PgClientPool`](PgClientPool.md)

## Constructors

### new PgClient()

> **new PgClient**(`options`): [`PgClient`](PgClient.md)

Initializes an instance of PgClient.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`PgClientOptions`](../interfaces/PgClientOptions.md) |

#### Returns

[`PgClient`](PgClient.md)

#### Overrides

[`Client`](Client.md).[`constructor`](Client.md#constructors)

#### Defined in

[src/pg/PgClient.ts:152](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L152)

## Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`PgClientOptions`](../interfaces/PgClientOptions.md)\>\> | `undefined` | Default values for the constructor options. |
| `options` | `Required`\<[`PgClientOptions`](../interfaces/PgClientOptions.md)\> | `undefined` | PgClient configuration options. |
| `shardName` | `string` | `"public"` | Name of the shard associated to this Client. |
| `timelineManager` | [`TimelineManager`](TimelineManager.md) | `undefined` | An active TimelineManager for this particular Client. |

## Methods

### address()

> `abstract` **address**(): `string`

Represents the full destination address this Client is working with.
Depending on the implementation, it may include hostname, port number,
database name, shard name etc. It is required that the address is stable
enough to be able to cache some destination database related metadata (e.g.
shardNos) based on that address.

#### Returns

`string`

#### Inherited from

[`Client`](Client.md).[`address`](Client.md#address)

#### Defined in

[src/abstract/Client.ts:87](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L87)

***

### end()

> `abstract` **end**(): `Promise`\<`void`\>

Gracefully closes the connections to let the caller destroy the Client. The
pending queries are awaited to finish before returning. The Client becomes
unusable after calling this method: you should not send queries to it.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Client`](Client.md).[`end`](Client.md#end)

#### Defined in

[src/abstract/Client.ts:94](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L94)

***

### isEnded()

> `abstract` **isEnded**(): `boolean`

Returns true if the Client is ended and can't be used anymore.

#### Returns

`boolean`

#### Inherited from

[`Client`](Client.md).[`isEnded`](Client.md#isended)

#### Defined in

[src/abstract/Client.ts:122](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L122)

***

### logSwallowedError()

> `protected` **logSwallowedError**(`props`): `void`

Calls swallowedErrorLogger() doing some preliminary amendment.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `props` | [`SwallowedErrorLoggerProps`](../interfaces/SwallowedErrorLoggerProps.md) |

#### Returns

`void`

#### Inherited from

[`Client`](Client.md).[`logSwallowedError`](Client.md#logswallowederror)

#### Defined in

[src/abstract/Client.ts:142](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L142)

***

### batcher()

> **batcher**\<`TInput`, `TOutput`, `TTable`\>(`_QueryClass`, `_schema`, `_additionalShape`, `runnerCreator`): [`Batcher`](Batcher.md)\<`TInput`, `TOutput`\>

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

#### Type Parameters

| Type Parameter |
| ------ |
| `TInput` |
| `TOutput` |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_QueryClass` | `Function` |
| `_schema` | [`Schema`](Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `_additionalShape` | `string` |
| `runnerCreator` | () => [`Runner`](Runner.md)\<`TInput`, `TOutput`\> |

#### Returns

[`Batcher`](Batcher.md)\<`TInput`, `TOutput`\>

#### Inherited from

[`Client`](Client.md).[`batcher`](Client.md#batcher)

#### Defined in

[src/abstract/Client.ts:179](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L179)

***

### prewarm()

> **prewarm**(): `void`

A convenience method to put connections prewarming logic to. The idea is to
keep the needed number of open connections and also, in each connection,
minimize the time which the very 1st query will take (e.g. pre-cache
full-text dictionaries).

#### Returns

`void`

#### Inherited from

[`Client`](Client.md).[`prewarm`](Client.md#prewarm)

#### Defined in

[src/abstract/Client.ts:199](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L199)

***

### poolStats()

> `abstract` **poolStats**(): `object`

Returns statistics about the connection pool.

#### Returns

`object`

##### totalConns

> **totalConns**: `number`

Total number of connections in the pool.

##### idleConns

> **idleConns**: `number`

Connections not busy running a query.

##### queuedReqs

> **queuedReqs**: `number`

Once all idle connections are over, requests are queued waiting for a
new available connection. This is the number of such queued requests.

#### Defined in

[src/pg/PgClient.ts:141](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L141)

***

### acquireConn()

> `abstract` **acquireConn**(): `Promise`\<[`PgClientConn`](../interfaces/PgClientConn.md)\>

Called when the Client needs a connection to run a query against. Implies
than the caller MUST call release() method on the returned object.

#### Returns

`Promise`\<[`PgClientConn`](../interfaces/PgClientConn.md)\>

#### Defined in

[src/pg/PgClient.ts:147](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L147)

***

### query()

> **query**\<`TRow`\>(`__namedParameters`): `Promise`\<`TRow`[]\>

Sends a query (internally, a multi-query). After the query finishes, we
should expect that role() returns the actual master/replica role.

#### Type Parameters

| Type Parameter |
| ------ |
| `TRow` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | `object` |
| `__namedParameters.query` | [`Literal`](../type-aliases/Literal.md) |
| `__namedParameters.hints`? | `Record`\<`string`, `string`\> |
| `__namedParameters.isWrite` | `boolean` |
| `__namedParameters.annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| `__namedParameters.op` | `string` |
| `__namedParameters.table` | `string` |
| `__namedParameters.batchFactor`? | `number` |

#### Returns

`Promise`\<`TRow`[]\>

#### Defined in

[src/pg/PgClient.ts:199](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L199)

***

### shardNos()

> **shardNos**(): `Promise`\<readonly `number`[]\>

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`\<readonly `number`[]\>

#### Overrides

[`Client`](Client.md).[`shardNos`](Client.md#shardnos)

#### Defined in

[src/pg/PgClient.ts:377](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L377)

***

### ping()

> **ping**(`__namedParameters`): `Promise`\<`void`\>

Sends a read or write test query to the server. Tells the server to sit and
wait for at least the provided number of milliseconds.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`ClientPingInput`](../interfaces/ClientPingInput.md) |

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Client`](Client.md).[`ping`](Client.md#ping)

#### Defined in

[src/pg/PgClient.ts:401](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L401)

***

### shardNoByID()

> **shardNoByID**(`id`): `number`

Extracts Shard number from an ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`number`

#### Overrides

[`Client`](Client.md).[`shardNoByID`](Client.md#shardnobyid)

#### Defined in

[src/pg/PgClient.ts:419](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L419)

***

### withShard()

> **withShard**(`no`): `this`

Creates a new Client which is namespaced to the provided Shard number. The
new Client will share the same connection pool with the parent's Client.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `no` | `number` |

#### Returns

`this`

#### Overrides

[`Client`](Client.md).[`withShard`](Client.md#withshard)

#### Defined in

[src/pg/PgClient.ts:475](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L475)

***

### role()

> **role**(): [`ClientRole`](../type-aliases/ClientRole.md)

Returns the Client's role reported after the last successful query. Master
and replica roles may switch online unpredictably, without reconnecting, so
we only know the role after a query.

#### Returns

[`ClientRole`](../type-aliases/ClientRole.md)

#### Overrides

[`Client`](Client.md).[`role`](Client.md#role)

#### Defined in

[src/pg/PgClient.ts:486](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L486)

***

### connectionIssue()

> **connectionIssue**(): `null` \| [`ClientConnectionIssue`](../interfaces/ClientConnectionIssue.md)

Returns a non-nullable value if the Client couldn't connect to the server
(or it could, but the load balancer reported the remote server as not
working), so it should ideally be removed from the list of active replicas
until e.g. the next discovery query to it (or any query) succeeds.

#### Returns

`null` \| [`ClientConnectionIssue`](../interfaces/ClientConnectionIssue.md)

#### Overrides

[`Client`](Client.md).[`connectionIssue`](Client.md#connectionissue)

#### Defined in

[src/pg/PgClient.ts:490](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L490)
