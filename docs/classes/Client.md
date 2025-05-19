[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Client

# Class: `abstract` Client

Defined in: [src/abstract/Client.ts:67](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L67)

Client is a Shard name aware abstraction which sends an actual query and
tracks the master/replica timeline. The concrete query sending implementation
(including required arguments) is up to the derived classes.

## Extended by

- [`PgClient`](PgClient.md)

## Constructors

### new Client()

> **new Client**(`options`): [`Client`](Client.md)

Defined in: [src/abstract/Client.ts:155](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L155)

Initializes an instance of Client.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ClientOptions`](../interfaces/ClientOptions.md) |

#### Returns

[`Client`](Client.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="default_options"></a> `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`ClientOptions`](../interfaces/ClientOptions.md)\>\> | Default values for the constructor options. |
| <a id="options-1"></a> `options` | `Required`\<[`ClientOptions`](../interfaces/ClientOptions.md)\> | Client configuration options. |
| <a id="shardname"></a> `shardName` | `string` | Each Client may be bound to some Shard, so the queries executed via it will be namespaced to this Shard. E.g. in relational databases, Shard name may be a namespace (or schema) name (or "public" if the Client wasn't created by withShard() method). |
| <a id="timelinemanager"></a> `timelineManager` | [`TimelineManager`](TimelineManager.md) | Tracks the master/replica replication timeline position. Shared across all the Clients within the same Island. |

## Methods

### address()

> `abstract` **address**(): `string`

Defined in: [src/abstract/Client.ts:95](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L95)

Represents the full destination address this Client is working with.
Depending on the implementation, it may include hostname, port number,
database name, shard name etc. It is required that the address is stable
enough to be able to cache some destination database related metadata (e.g.
shardNos) based on that address.

#### Returns

`string`

***

### end()

> `abstract` **end**(): `Promise`\<`void`\>

Defined in: [src/abstract/Client.ts:102](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L102)

Gracefully closes the connections to let the caller destroy the Client. The
pending queries are awaited to finish before returning. The Client becomes
unusable after calling this method: you should not send queries to it.

#### Returns

`Promise`\<`void`\>

***

### isEnded()

> `abstract` **isEnded**(): `boolean`

Defined in: [src/abstract/Client.ts:107](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L107)

Returns true if the Client is ended and can't be used anymore.

#### Returns

`boolean`

***

### shardNos()

> `abstract` **shardNos**(): `Promise`\<readonly `number`[]\>

Defined in: [src/abstract/Client.ts:113](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L113)

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`\<readonly `number`[]\>

***

### ping()

> `abstract` **ping**(`input`): `Promise`\<`void`\>

Defined in: [src/abstract/Client.ts:119](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L119)

Sends a read or write test query to the server. Tells the server to sit and
wait for at least the provided number of milliseconds.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ClientPingInput`](../interfaces/ClientPingInput.md) |

#### Returns

`Promise`\<`void`\>

***

### withShard()

> `abstract` **withShard**(`no`): `this`

Defined in: [src/abstract/Client.ts:125](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L125)

Creates a new Client which is namespaced to the provided Shard number. The
new Client will share the same connection pool with the parent's Client.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `no` | `number` |

#### Returns

`this`

***

### role()

> `abstract` **role**(): [`ClientRole`](../type-aliases/ClientRole.md)

Defined in: [src/abstract/Client.ts:132](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L132)

Returns the Client's role reported after the last successful query. Master
and replica roles may switch online unpredictably, without reconnecting, so
we only know the role after a query.

#### Returns

[`ClientRole`](../type-aliases/ClientRole.md)

***

### connectionIssue()

> `abstract` **connectionIssue**(): `null` \| [`ClientConnectionIssue`](../interfaces/ClientConnectionIssue.md)

Defined in: [src/abstract/Client.ts:140](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L140)

Returns a non-nullable value if the Client couldn't connect to the server
(or it could, but the load balancer reported the remote server as not
working), so it should ideally be removed from the list of active replicas
until e.g. the next discovery query to it (or any query) succeeds.

#### Returns

`null` \| [`ClientConnectionIssue`](../interfaces/ClientConnectionIssue.md)

***

### logSwallowedError()

> `protected` **logSwallowedError**(`props`): `void`

Defined in: [src/abstract/Client.ts:145](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L145)

Calls swallowedErrorLogger() doing some preliminary amendment.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `props` | [`SwallowedErrorLoggerProps`](../interfaces/SwallowedErrorLoggerProps.md) |

#### Returns

`void`

***

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

***

### prewarm()

> **prewarm**(): `void`

Defined in: [src/abstract/Client.ts:210](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L210)

A convenience method to put connections prewarming logic to. The idea is to
keep the needed number of open connections and also, in each connection,
minimize the time which the very 1st query will take (e.g. pre-cache
full-text dictionaries).

#### Returns

`void`
