[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Client

# Class: Client

Client is a Shard name aware abstraction which sends an actual query and
tracks the master/replica timeline. The concrete query sending implementation
(including required arguments) is up to the derived classes.

## Hierarchy

- **`Client`**

  ↳ [`PgClient`](PgClient.md)

## Constructors

### constructor

• **new Client**(`options`): [`Client`](Client.md)

Initializes an instance of Client.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`ClientOptions`](../interfaces/ClientOptions.md) |

#### Returns

[`Client`](Client.md)

#### Defined in

[src/abstract/Client.ts:152](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L152)

## Properties

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`\<`PickPartial`\<[`ClientOptions`](../interfaces/ClientOptions.md)\>\>

Default values for the constructor options.

#### Defined in

[src/abstract/Client.ts:62](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L62)

___

### options

• `Readonly` **options**: `Required`\<[`ClientOptions`](../interfaces/ClientOptions.md)\>

Client configuration options.

#### Defined in

[src/abstract/Client.ts:68](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L68)

___

### shardName

• `Readonly` `Abstract` **shardName**: `string`

Each Client may be bound to some Shard, so the queries executed via it
will be namespaced to this Shard. E.g. in relational databases, Shard name
may be a namespace (or schema) name (or "public" if the Client wasn't
created by withShard() method).

#### Defined in

[src/abstract/Client.ts:74](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L74)

___

### timelineManager

• `Readonly` `Abstract` **timelineManager**: [`TimelineManager`](TimelineManager.md)

Tracks the master/replica replication timeline position. Shared across all
the Clients within the same Island.

#### Defined in

[src/abstract/Client.ts:78](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L78)

## Methods

### address

▸ **address**(): `string`

Represents the full destination address this Client is working with.
Depending on the implementation, it may include hostname, port number,
database name, shard name etc. It is required that the address is stable
enough to be able to cache some destination database related metadata (e.g.
shardNos) based on that address.

#### Returns

`string`

#### Defined in

[src/abstract/Client.ts:87](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L87)

___

### end

▸ **end**(): `Promise`\<`void`\>

Gracefully closes the connections to let the caller destroy the Client. The
pending queries are awaited to finish before returning. The Client becomes
unusable after calling this method: you should not send queries to it.

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/abstract/Client.ts:94](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L94)

___

### shardNos

▸ **shardNos**(): `Promise`\<readonly `number`[]\>

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`\<readonly `number`[]\>

#### Defined in

[src/abstract/Client.ts:100](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L100)

___

### ping

▸ **ping**(`input`): `Promise`\<`void`\>

Sends a read or write test query to the server. Tells the server to sit and
wait for at least the provided number of milliseconds.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`ClientPingInput`](../interfaces/ClientPingInput.md) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/abstract/Client.ts:106](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L106)

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

#### Defined in

[src/abstract/Client.ts:111](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L111)

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

#### Defined in

[src/abstract/Client.ts:117](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L117)

___

### isEnded

▸ **isEnded**(): `boolean`

Returns true if the Client is ended and can't be used anymore.

#### Returns

`boolean`

#### Defined in

[src/abstract/Client.ts:122](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L122)

___

### role

▸ **role**(): [`ClientRole`](../modules.md#clientrole)

Returns the Client's role reported after the last successful query. Master
and replica roles may switch online unpredictably, without reconnecting, so
we only know the role after a query.

#### Returns

[`ClientRole`](../modules.md#clientrole)

#### Defined in

[src/abstract/Client.ts:129](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L129)

___

### connectionIssue

▸ **connectionIssue**(): ``null`` \| [`ClientConnectionIssue`](../interfaces/ClientConnectionIssue.md)

Returns a non-nullable value if the Client couldn't connect to the server
(or it could, but the load balancer reported the remote server as not
working), so it should ideally be removed from the list of active replicas
until e.g. the next discovery query to it (or any query) succeeds.

#### Returns

``null`` \| [`ClientConnectionIssue`](../interfaces/ClientConnectionIssue.md)

#### Defined in

[src/abstract/Client.ts:137](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L137)

___

### logSwallowedError

▸ **logSwallowedError**(`props`): `void`

Calls swallowedErrorLogger() doing some preliminary amendment.

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`SwallowedErrorLoggerProps`](../interfaces/SwallowedErrorLoggerProps.md) |

#### Returns

`void`

#### Defined in

[src/abstract/Client.ts:142](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L142)

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

#### Defined in

[src/abstract/Client.ts:179](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L179)

___

### prewarm

▸ **prewarm**(): `void`

A convenience method to put connections prewarming logic to. The idea is to
keep the needed number of open connections and also, in each connection,
minimize the time which the very 1st query will take (e.g. pre-cache
full-text dictionaries).

#### Returns

`void`

#### Defined in

[src/abstract/Client.ts:199](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L199)
