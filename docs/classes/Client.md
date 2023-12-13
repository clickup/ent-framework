[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Client

# Class: Client

Client is a Shard name aware abstraction which sends an actual query and
tracks the master/replica timeline. The concrete query sending implementation
(including required arguments) is up to the derived classes.

## Hierarchy

- **`Client`**

  ↳ [`SQLClient`](SQLClient.md)

## Constructors

### constructor

• **new Client**(`name`, `isMaster`, `loggers`, `batchDelayMs?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `isMaster` | `boolean` |
| `loggers` | [`Loggers`](../interfaces/Loggers.md) |
| `batchDelayMs?` | `number` \| () => `number` |

#### Defined in

[src/abstract/Client.ts:51](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L51)

## Properties

### shardName

• `Readonly` `Abstract` **shardName**: `string`

Each Client may be bound to some Shard, so the queries executed via it will
be namespaced to this Shard. E.g. in PostgreSQL, Shard name is schema name
(or "public" if the Client wasn't created by withShard() method).

#### Defined in

[src/abstract/Client.ts:19](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L19)

___

### timelineManager

• `Readonly` `Abstract` **timelineManager**: [`TimelineManager`](TimelineManager.md)

Tracks the master/replica replication timeline position. Shared across all
the Clients within the same Island.

#### Defined in

[src/abstract/Client.ts:25](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L25)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[src/abstract/Client.ts:52](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L52)

___

### isMaster

• `Readonly` **isMaster**: `boolean`

#### Defined in

[src/abstract/Client.ts:53](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L53)

___

### loggers

• `Readonly` **loggers**: [`Loggers`](../interfaces/Loggers.md)

#### Defined in

[src/abstract/Client.ts:54](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L54)

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

#### Defined in

[src/abstract/Client.ts:32](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L32)

___

### shardNos

▸ `Abstract` **shardNos**(): `Promise`<readonly `number`[]\>

Returns all Shard numbers discoverable via the connection to the Client's
database.

#### Returns

`Promise`<readonly `number`[]\>

#### Defined in

[src/abstract/Client.ts:38](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L38)

___

### shardNoByID

▸ `Abstract` **shardNoByID**(`id`): `number`

Extracts Shard number from an ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`number`

#### Defined in

[src/abstract/Client.ts:43](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L43)

___

### withShard

▸ `Abstract` **withShard**(`no`): [`Client`](Client.md)

Creates a new Client which is namespaced to the provided Shard number. The
new Client will share the same connection pool with the parent's Client.

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |

#### Returns

[`Client`](Client.md)

#### Defined in

[src/abstract/Client.ts:49](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L49)

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

#### Defined in

[src/abstract/Client.ts:81](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L81)

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

[src/abstract/Client.ts:102](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L102)

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

[src/abstract/Client.ts:120](https://github.com/clickup/rest-client/blob/master/src/abstract/Client.ts#L120)
