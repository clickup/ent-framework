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

[src/abstract/Client.ts:96](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L96)

## Properties

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`\<`PickPartial`\<[`ClientOptions`](../interfaces/ClientOptions.md)\>\>

Default values for the constructor options.

#### Defined in

[src/abstract/Client.ts:32](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L32)

___

### options

• `Readonly` **options**: `Required`\<[`ClientOptions`](../interfaces/ClientOptions.md)\>

Client configuration options.

#### Defined in

[src/abstract/Client.ts:37](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L37)

___

### shardName

• `Readonly` `Abstract` **shardName**: `string`

Each Client may be bound to some Shard, so the queries executed via it
will be namespaced to this Shard. E.g. in relational databases, Shard name
may be a namespace (or schema) name (or "public" if the Client wasn't
created by withShard() method).

#### Defined in

[src/abstract/Client.ts:43](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L43)

___

### timelineManager

• `Readonly` `Abstract` **timelineManager**: [`TimelineManager`](TimelineManager.md)

Tracks the master/replica replication timeline position. Shared across all
the Clients within the same Island.

#### Defined in

[src/abstract/Client.ts:47](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L47)

## Methods

### end

▸ **end**(): `Promise`\<`void`\>

Gracefully closes the connections to let the caller destroy the Client. The
pending queries are awaited to finish before returning. The Client becomes
unusable after calling this method: you should not send queries to it.

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/abstract/Client.ts:54](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L54)

___

### shardNos

▸ **shardNos**(): `Promise`\<readonly `number`[]\>

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`\<readonly `number`[]\>

#### Defined in

[src/abstract/Client.ts:60](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L60)

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

[src/abstract/Client.ts:65](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L65)

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

[src/abstract/Client.ts:71](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L71)

___

### isEnded

▸ **isEnded**(): `boolean`

Returns true if the Client is ended and can't be used anymore.

#### Returns

`boolean`

#### Defined in

[src/abstract/Client.ts:76](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L76)

___

### isMaster

▸ **isMaster**(): `boolean`

Returns true if, after the last query, the Client reported being a master
node. Master and replica roles may switch online unpredictably, without
reconnecting, so we only know the role after a query.

#### Returns

`boolean`

#### Defined in

[src/abstract/Client.ts:83](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L83)

___

### isConnectionIssue

▸ **isConnectionIssue**(): `boolean`

Returns true if the Client couldn't connect to the server (or it could, but
the load balancer reported the remote server as not working), so it should
ideally be removed from the list of active replicas until e.g. the next
discovery query to it (or any query) succeeds.

#### Returns

`boolean`

#### Defined in

[src/abstract/Client.ts:91](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L91)

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

#### Defined in

[src/abstract/Client.ts:158](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L158)
