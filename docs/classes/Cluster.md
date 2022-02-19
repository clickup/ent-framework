[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Cluster

# Class: Cluster<TClient\>

Cluster is a collection of islands and an orchestration
of shardNo -> island resolution.

It's unknown beforehand, which island some particular shard belongs to;
the resolution is done asynchronously and lazily.

Shard 0 is a special "global" shard.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

## Constructors

### constructor

• **new Cluster**<`TClient`\>(`numReadShards`, `numWriteShards`, `islands`, `shardsRediscoverMs?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md)<`TClient`\> |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `numReadShards` | `number` | `undefined` |
| `numWriteShards` | `number` | `undefined` |
| `islands` | readonly [`Island`](Island.md)<`TClient`\>[] | `undefined` |
| `shardsRediscoverMs` | `number` | `10000` |

#### Defined in

[packages/ent-framework/src/abstract/Cluster.ts:40](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Cluster.ts#L40)

## Properties

### islands

• `Readonly` **islands**: `ReadonlyMap`<`number`, [`Island`](Island.md)<`TClient`\>\>

#### Defined in

[packages/ent-framework/src/abstract/Cluster.ts:35](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Cluster.ts#L35)

___

### numReadShards

• `Readonly` **numReadShards**: `number`

___

### numWriteShards

• `Readonly` **numWriteShards**: `number`

___

### shards

• `Readonly` **shards**: `ReadonlyMap`<`number`, [`Shard`](Shard.md)<`TClient`\>\>

#### Defined in

[packages/ent-framework/src/abstract/Cluster.ts:34](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Cluster.ts#L34)

___

### shardsRediscoverMs

• `Readonly` **shardsRediscoverMs**: `number` = `10000`

## Methods

### globalShard

▸ **globalShard**(): [`Shard`](Shard.md)<`TClient`\>

#### Returns

[`Shard`](Shard.md)<`TClient`\>

#### Defined in

[packages/ent-framework/src/abstract/Cluster.ts:75](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Cluster.ts#L75)

___

### islandShards

▸ **islandShards**(`islandNo`): `Promise`<[`Shard`](Shard.md)<`TClient`\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `islandNo` | `number` |

#### Returns

`Promise`<[`Shard`](Shard.md)<`TClient`\>[]\>

#### Defined in

[packages/ent-framework/src/abstract/Cluster.ts:100](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Cluster.ts#L100)

___

### prewarm

▸ **prewarm**(): `void`

#### Returns

`void`

#### Defined in

[packages/ent-framework/src/abstract/Cluster.ts:68](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Cluster.ts#L68)

___

### randomShard

▸ **randomShard**(): [`Shard`](Shard.md)<`TClient`\>

#### Returns

[`Shard`](Shard.md)<`TClient`\>

#### Defined in

[packages/ent-framework/src/abstract/Cluster.ts:79](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Cluster.ts#L79)

___

### shard

▸ **shard**(`id`): [`Shard`](Shard.md)<`TClient`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`Shard`](Shard.md)<`TClient`\>

#### Defined in

[packages/ent-framework/src/abstract/Cluster.ts:85](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Cluster.ts#L85)

___

### throwOnBadShardNo

▸ **throwOnBadShardNo**(`shardNo`): `never`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shardNo` | `number` |

#### Returns

`never`

#### Defined in

[packages/ent-framework/src/abstract/Cluster.ts:156](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Cluster.ts#L156)
