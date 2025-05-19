[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgClient

# Class: PgClient\<TPool\>

Defined in: [src/pg/PgClient.ts:127](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L127)

An abstract PostgreSQL Client. Includes connection pooling logic.

Since the class is cloneable internally (using the prototype substitution
technique, see withShard()), the contract of this class is that ALL its
derived classes may only have readonly immediate properties. Use Ref helper
if you need some mutable properties.

## Extends

- [`Client`](Client.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TPool` *extends* `pg.Pool` | `pg.Pool` |

## Constructors

### new PgClient()

> **new PgClient**\<`TPool`\>(`options`): [`PgClient`](PgClient.md)\<`TPool`\>

Defined in: [src/pg/PgClient.ts:189](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L189)

Initializes an instance of PgClient.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`PgClientOptions`](../interfaces/PgClientOptions.md)\<`TPool`\> |

#### Returns

[`PgClient`](PgClient.md)\<`TPool`\>

#### Overrides

[`Client`](Client.md).[`constructor`](Client.md#constructors)

## Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="default_options"></a> `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`PgClientOptions`](../interfaces/PgClientOptions.md)\<`Pool`\>\>\> | `undefined` | Default values for the constructor options. |
| <a id="options-1"></a> `options` | `Required`\<[`PgClientOptions`](../interfaces/PgClientOptions.md)\<`TPool`\>\> | `undefined` | PgClient configuration options. |
| <a id="shardname"></a> `shardName` | `string` | `"public"` | Name of the shard associated to this Client. |
| <a id="timelinemanager"></a> `timelineManager` | [`TimelineManager`](TimelineManager.md) | `undefined` | An active TimelineManager for this particular Client. |

## Methods

### batcher()

> **batcher**\<`TInput`, `TOutput`, `TTable`\>(`_QueryClass`, `_schema`, `_additionalShape`, `disableBatching`, `runnerCreator`): [`Batcher`](Batcher.md)\<`TInput`, `TOutput`\>

Defined in: [src/abstract/Client.ts:185](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L185)

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

[`Client`](Client.md).[`batcher`](Client.md#batcher)

***

### logSwallowedError()

> `protected` **logSwallowedError**(`props`): `void`

Defined in: [src/pg/PgClient.ts:180](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L180)

Calls swallowedErrorLogger() doing some preliminary amendment.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `props` | [`SwallowedErrorLoggerProps`](../interfaces/SwallowedErrorLoggerProps.md) |

#### Returns

`void`

#### Overrides

[`Client`](Client.md).[`logSwallowedError`](Client.md#logswallowederror)

***

### address()

> **address**(): `string`

Defined in: [src/pg/PgClient.ts:238](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L238)

Represents the full destination address this Client is working with.
Depending on the implementation, it may include hostname, port number,
database name, shard name etc. It is required that the address is stable
enough to be able to cache some destination database related metadata (e.g.
shardNos) based on that address.

#### Returns

`string`

#### Overrides

[`Client`](Client.md).[`address`](Client.md#address)

***

### end()

> **end**(): `Promise`\<`void`\>

Defined in: [src/pg/PgClient.ts:255](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L255)

Gracefully closes all the connections of this Client to let the caller
destroy it. The pending queries are awaited to finish before returning. The
Client becomes unusable right after calling this method (even before the
connections are drained): you should not send queries to it.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Client`](Client.md).[`end`](Client.md#end)

***

### isEnded()

> **isEnded**(): `boolean`

Defined in: [src/pg/PgClient.ts:269](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L269)

Returns true if the Client is ended and can't be used anymore.

#### Returns

`boolean`

#### Overrides

[`Client`](Client.md).[`isEnded`](Client.md#isended)

***

### shardNos()

> **shardNos**(): `Promise`\<readonly `number`[]\>

Defined in: [src/pg/PgClient.ts:277](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L277)

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`\<readonly `number`[]\>

#### Overrides

[`Client`](Client.md).[`shardNos`](Client.md#shardnos)

***

### ping()

> **ping**(`__namedParameters`): `Promise`\<`void`\>

Defined in: [src/pg/PgClient.ts:304](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L304)

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

***

### withShard()

> **withShard**(`no`): `this`

Defined in: [src/pg/PgClient.ts:326](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L326)

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

***

### role()

> **role**(): [`ClientRole`](../type-aliases/ClientRole.md)

Defined in: [src/pg/PgClient.ts:344](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L344)

Returns the Client's role reported after the last successful query. Master
and replica roles may switch online unpredictably, without reconnecting, so
we only know the role after a query.

#### Returns

[`ClientRole`](../type-aliases/ClientRole.md)

#### Overrides

[`Client`](Client.md).[`role`](Client.md#role)

***

### connectionIssue()

> **connectionIssue**(): `null` \| [`ClientConnectionIssue`](../interfaces/ClientConnectionIssue.md)

Defined in: [src/pg/PgClient.ts:354](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L354)

Returns a non-nullable value if the Client couldn't connect to the server
(or it could, but the load balancer reported the remote server as not
working), so it should ideally be removed from the list of active replicas
until e.g. the next discovery query to it (or any query) succeeds.

#### Returns

`null` \| [`ClientConnectionIssue`](../interfaces/ClientConnectionIssue.md)

#### Overrides

[`Client`](Client.md).[`connectionIssue`](Client.md#connectionissue)

***

### prewarm()

> **prewarm**(): `void`

Defined in: [src/pg/PgClient.ts:364](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L364)

A convenience method to put connections prewarming logic to. The idea is to
keep the needed number of open connections and also, in each connection,
minimize the time which the very 1st query will take (e.g. pre-cache
full-text dictionaries).

#### Returns

`void`

#### Overrides

[`Client`](Client.md).[`prewarm`](Client.md#prewarm)

***

### pool()

> **pool**(`subPoolConfig`?): `TPool`

Defined in: [src/pg/PgClient.ts:428](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L428)

Returns a default pool (when subPoolConfig is not passed), or a "sub-pool"
(a named low-level Pool implementation compatible to node-postgres). The
method is specific to the current class and is not a part of
database-agnostic Client API.
- Sub-pools are lazily created and memoized by the provided name. They may
  differ by config options (like statement_timeout or max connections).
- Sub-pools inherit the properties from default PgClientOptions.config.
- It is implied (but not enforced) that all sub-pools use the same physical
  database, because otherwise it makes not a lot of sense.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `subPoolConfig`? | [`PgClientSubPoolConfig`](../interfaces/PgClientSubPoolConfig.md) |

#### Returns

`TPool`

***

### acquireConn()

> **acquireConn**(`subPoolConfig`?): `Promise`\<[`PgClientConn`](../interfaces/PgClientConn.md)\<`TPool`\>\>

Defined in: [src/pg/PgClient.ts:487](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L487)

Called when the Client needs a connection in the default pool (when
subPoolConfig is not passed), or in a sub-pool (see pool() method) to run a
query against. Implies than the caller MUST call release() method on the
returned object. The difference from pool().connect() is that when calling
release() on a result of acquireConn(), it additionally closes the
connection automatically if was OPENED (not queried!) more than
maxConnLifetimeMs ago (node-postgres Pool doesn't have this feature) The
method is specific to the current class and is not a part of
database-agnostic Client API.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `subPoolConfig`? | [`PgClientSubPoolConfig`](../interfaces/PgClientSubPoolConfig.md) |

#### Returns

`Promise`\<[`PgClientConn`](../interfaces/PgClientConn.md)\<`TPool`\>\>

***

### query()

> **query**\<`TRow`\>(`__namedParameters`): `Promise`\<`TRow`[]\>

Defined in: [src/pg/PgClient.ts:511](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L511)

Sends a query (internally, a multi-query) through the default Pool (if
subPoolConfig is not passed), or through a named sub-pool (see pool()
method). After the query finishes, we should expect that role() returns the
actual master/replica role. The method is specific to the current class and
is not a part of database-agnostic Client API.

#### Type Parameters

| Type Parameter |
| ------ |
| `TRow` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | \{ `query`: [`Literal`](../type-aliases/Literal.md); `hints`: [`Hints`](../type-aliases/Hints.md); `isWrite`: `boolean`; `annotations`: [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[]; `op`: `string`; `table`: `string`; `batchFactor`: `number`; `subPoolConfig`: [`PgClientSubPoolConfig`](../interfaces/PgClientSubPoolConfig.md); \} |
| `__namedParameters.query` | [`Literal`](../type-aliases/Literal.md) |
| `__namedParameters.hints`? | [`Hints`](../type-aliases/Hints.md) |
| `__namedParameters.isWrite` | `boolean` |
| `__namedParameters.annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |
| `__namedParameters.op` | `string` |
| `__namedParameters.table` | `string` |
| `__namedParameters.batchFactor`? | `number` |
| `__namedParameters.subPoolConfig`? | [`PgClientSubPoolConfig`](../interfaces/PgClientSubPoolConfig.md) |

#### Returns

`Promise`\<`TRow`[]\>
