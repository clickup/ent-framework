[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgClientPool

# Class: PgClientPool

Defined in: [src/pg/PgClientPool.ts:48](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L48)

This class carries connection pooling logic only and delegates the rest to
PgClient base class.

The idea is that in each particular project, people may have they own classes
derived from PgClient, in case the codebase already has some existing
connection pooling solution. They don't have to use PgClientPool.

## Extends

- [`PgClient`](PgClient.md)

## Constructors

### new PgClientPool()

> **new PgClientPool**(`options`): [`PgClientPool`](PgClientPool.md)

Defined in: [src/pg/PgClientPool.ts:80](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L80)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`PgClientPoolOptions`](../interfaces/PgClientPoolOptions.md) |

#### Returns

[`PgClientPool`](PgClientPool.md)

#### Overrides

[`PgClient`](PgClient.md).[`constructor`](PgClient.md#constructors)

## Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="shardname"></a> `shardName` | `string` | `"public"` | Name of the shard associated to this Client. |
| <a id="timelinemanager"></a> `timelineManager` | [`TimelineManager`](TimelineManager.md) | `undefined` | An active TimelineManager for this particular Client. |
| <a id="default_options"></a> `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`PgClientPoolOptions`](../interfaces/PgClientPoolOptions.md)\>\> | `undefined` | Default values for the constructor options. |
| <a id="options-1"></a> `options` | `Required`\<[`PgClientPoolOptions`](../interfaces/PgClientPoolOptions.md)\> | `undefined` | PgClientPool configuration options. |

## Methods

### batcher()

> **batcher**\<`TInput`, `TOutput`, `TTable`\>(`_QueryClass`, `_schema`, `_additionalShape`, `disableBatching`, `runnerCreator`): [`Batcher`](Batcher.md)\<`TInput`, `TOutput`\>

Defined in: [src/abstract/Client.ts:183](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L183)

Batcher is per-Client per-query-type
per-table-name-and-shape-and-disableBatching:

- Per-Client means that batchers are removed as soon as the Client is
  removed, i.e. the Client owns all the batchers for all tables.
- Per-query-type means that the batcher for a SELECT query is different
  from the batcher for an INSERT query (obviously).
- Per-table-name-and-shape-and-disableBatching means that each table has
  its own set of batchers (obviously). Also, some queries may be complex
  (like UPDATE), so the batcher also depends on the "shape" - the list of
  fields we're updating. Plus, for some inputs, we want to disable batching
  at all - that produces a separate Batcher instance.

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
| `disableBatching` | `boolean` |
| `runnerCreator` | () => [`Runner`](Runner.md)\<`TInput`, `TOutput`\> |

#### Returns

[`Batcher`](Batcher.md)\<`TInput`, `TOutput`\>

#### Inherited from

[`PgClient`](PgClient.md).[`batcher`](PgClient.md#batcher)

***

### query()

> **query**\<`TRow`\>(`__namedParameters`): `Promise`\<`TRow`[]\>

Defined in: [src/pg/PgClient.ts:210](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L210)

Sends a query (internally, a multi-query). After the query finishes, we
should expect that role() returns the actual master/replica role.

#### Type Parameters

| Type Parameter |
| ------ |
| `TRow` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | \{ `query`: [`Literal`](../type-aliases/Literal.md); `hints`: [`Hints`](../type-aliases/Hints.md); `isWrite`: `boolean`; `annotations`: [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[]; `op`: `string`; `table`: `string`; `batchFactor`: `number`; \} |
| `__namedParameters.query` | [`Literal`](../type-aliases/Literal.md) |
| `__namedParameters.hints`? | [`Hints`](../type-aliases/Hints.md) |
| `__namedParameters.isWrite` | `boolean` |
| `__namedParameters.annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| `__namedParameters.op` | `string` |
| `__namedParameters.table` | `string` |
| `__namedParameters.batchFactor`? | `number` |

#### Returns

`Promise`\<`TRow`[]\>

#### Inherited from

[`PgClient`](PgClient.md).[`query`](PgClient.md#query)

***

### shardNos()

> **shardNos**(): `Promise`\<readonly `number`[]\>

Defined in: [src/pg/PgClient.ts:408](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L408)

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`\<readonly `number`[]\>

#### Inherited from

[`PgClient`](PgClient.md).[`shardNos`](PgClient.md#shardnos)

***

### ping()

> **ping**(`__namedParameters`): `Promise`\<`void`\>

Defined in: [src/pg/PgClient.ts:432](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L432)

Sends a read or write test query to the server. Tells the server to sit and
wait for at least the provided number of milliseconds.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`ClientPingInput`](../interfaces/ClientPingInput.md) |

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`PgClient`](PgClient.md).[`ping`](PgClient.md#ping)

***

### shardNoByID()

> **shardNoByID**(`id`): `number`

Defined in: [src/pg/PgClient.ts:450](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L450)

Extracts Shard number from an ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`number`

#### Inherited from

[`PgClient`](PgClient.md).[`shardNoByID`](PgClient.md#shardnobyid)

***

### withShard()

> **withShard**(`no`): `this`

Defined in: [src/pg/PgClient.ts:506](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L506)

Creates a new Client which is namespaced to the provided Shard number. The
new Client will share the same connection pool with the parent's Client.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `no` | `number` |

#### Returns

`this`

#### Inherited from

[`PgClient`](PgClient.md).[`withShard`](PgClient.md#withshard)

***

### role()

> **role**(): [`ClientRole`](../type-aliases/ClientRole.md)

Defined in: [src/pg/PgClient.ts:517](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L517)

Returns the Client's role reported after the last successful query. Master
and replica roles may switch online unpredictably, without reconnecting, so
we only know the role after a query.

#### Returns

[`ClientRole`](../type-aliases/ClientRole.md)

#### Inherited from

[`PgClient`](PgClient.md).[`role`](PgClient.md#role)

***

### connectionIssue()

> **connectionIssue**(): `null` \| [`ClientConnectionIssue`](../interfaces/ClientConnectionIssue.md)

Defined in: [src/pg/PgClient.ts:521](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L521)

Returns a non-nullable value if the Client couldn't connect to the server
(or it could, but the load balancer reported the remote server as not
working), so it should ideally be removed from the list of active replicas
until e.g. the next discovery query to it (or any query) succeeds.

#### Returns

`null` \| [`ClientConnectionIssue`](../interfaces/ClientConnectionIssue.md)

#### Inherited from

[`PgClient`](PgClient.md).[`connectionIssue`](PgClient.md#connectionissue)

***

### acquireConn()

> **acquireConn**(): `Promise`\<[`PgClientConn`](../interfaces/PgClientConn.md)\>

Defined in: [src/pg/PgClientPool.ts:122](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L122)

Called when the Client needs a connection to run a query against. Implies
than the caller MUST call release() method on the returned object.

#### Returns

`Promise`\<[`PgClientConn`](../interfaces/PgClientConn.md)\>

#### Overrides

[`PgClient`](PgClient.md).[`acquireConn`](PgClient.md#acquireconn)

***

### poolStats()

> **poolStats**(): `object`

Defined in: [src/pg/PgClientPool.ts:135](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L135)

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

#### Overrides

[`PgClient`](PgClient.md).[`poolStats`](PgClient.md#poolstats)

***

### address()

> **address**(): `string`

Defined in: [src/pg/PgClientPool.ts:143](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L143)

Represents the full destination address this Client is working with.
Depending on the implementation, it may include hostname, port number,
database name, shard name etc. It is required that the address is stable
enough to be able to cache some destination database related metadata (e.g.
shardNos) based on that address.

#### Returns

`string`

#### Overrides

[`PgClient`](PgClient.md).[`address`](PgClient.md#address)

***

### logSwallowedError()

> **logSwallowedError**(`props`): `void`

Defined in: [src/pg/PgClientPool.ts:154](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L154)

Calls swallowedErrorLogger() doing some preliminary amendment.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `props` | [`SwallowedErrorLoggerProps`](../interfaces/SwallowedErrorLoggerProps.md) |

#### Returns

`void`

#### Overrides

[`PgClient`](PgClient.md).[`logSwallowedError`](PgClient.md#logswallowederror)

***

### end()

> **end**(): `Promise`\<`void`\>

Defined in: [src/pg/PgClientPool.ts:160](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L160)

Gracefully closes the connections to let the caller destroy the Client. The
pending queries are awaited to finish before returning. The Client becomes
unusable after calling this method: you should not send queries to it.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`PgClient`](PgClient.md).[`end`](PgClient.md#end)

***

### isEnded()

> **isEnded**(): `boolean`

Defined in: [src/pg/PgClientPool.ts:171](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L171)

Returns true if the Client is ended and can't be used anymore.

#### Returns

`boolean`

#### Overrides

[`PgClient`](PgClient.md).[`isEnded`](PgClient.md#isended)

***

### prewarm()

> **prewarm**(): `void`

Defined in: [src/pg/PgClientPool.ts:175](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L175)

A convenience method to put connections prewarming logic to. The idea is to
keep the needed number of open connections and also, in each connection,
minimize the time which the very 1st query will take (e.g. pre-cache
full-text dictionaries).

#### Returns

`void`

#### Overrides

[`PgClient`](PgClient.md).[`prewarm`](PgClient.md#prewarm)
