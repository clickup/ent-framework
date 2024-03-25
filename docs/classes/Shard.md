[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Shard

# Class: Shard\<TClient\>

Shard lives within an Island with one master and N replicas.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

## Constructors

### constructor

• **new Shard**\<`TClient`\>(`no`, `runWithLocatedIsland`): [`Shard`](Shard.md)\<`TClient`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `no` | `number` | Shard number. |
| `runWithLocatedIsland` | \<TRes\>(`body`: (`island`: [`Island`](Island.md)\<`TClient`\>, `attempt`: `number`) => `Promise`\<`TRes`\>) => `Promise`\<`TRes`\> | A middleware to wrap queries with. It's responsible for locating the right Island and retrying the call to body() (i.e. failed queries) in case e.g. a shard is moved to another Island. |

#### Returns

[`Shard`](Shard.md)\<`TClient`\>

#### Defined in

[src/abstract/Shard.ts:24](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L24)

## Properties

### no

• `Readonly` **no**: `number`

Shard number.

#### Defined in

[src/abstract/Shard.ts:26](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L26)

___

### runWithLocatedIsland

• `Readonly` **runWithLocatedIsland**: \<TRes\>(`body`: (`island`: [`Island`](Island.md)\<`TClient`\>, `attempt`: `number`) => `Promise`\<`TRes`\>) => `Promise`\<`TRes`\>

A middleware to wrap queries with. It's responsible for locating the
right Island and retrying the call to body() (i.e. failed queries) in
case e.g. a shard is moved to another Island.

#### Type declaration

▸ \<`TRes`\>(`body`): `Promise`\<`TRes`\>

##### Type parameters

| Name |
| :------ |
| `TRes` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `body` | (`island`: [`Island`](Island.md)\<`TClient`\>, `attempt`: `number`) => `Promise`\<`TRes`\> |

##### Returns

`Promise`\<`TRes`\>

#### Defined in

[src/abstract/Shard.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L30)

## Methods

### client

▸ **client**(`timeline`): `Promise`\<`TClient`\>

Chooses the right Client to be used for this Shard. We don't memoize,
because the Shard may relocate to another Island during re-discovery.

#### Parameters

| Name | Type |
| :------ | :------ |
| `timeline` | [`Timeline`](Timeline.md) \| typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica) |

#### Returns

`Promise`\<`TClient`\>

#### Defined in

[src/abstract/Shard.ts:39](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L39)

___

### run

▸ **run**\<`TOutput`\>(`query`, `annotation`, `timeline`, `freshness`): `Promise`\<`TOutput`\>

Runs a query after choosing the right Client (destination connection,
Shard, annotation etc.)

#### Type parameters

| Name |
| :------ |
| `TOutput` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`Query`](../interfaces/Query.md)\<`TOutput`\> |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |
| `timeline` | [`Timeline`](Timeline.md) |
| `freshness` | ``null`` \| typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica) |

#### Returns

`Promise`\<`TOutput`\>

#### Defined in

[src/abstract/Shard.ts:52](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L52)

___

### assertDiscoverable

▸ **assertDiscoverable**(): `Promise`\<`void`\>

Throws if this Shard does not exist, or its Island is down, or something
else is wrong with it.

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/abstract/Shard.ts:89](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L89)
