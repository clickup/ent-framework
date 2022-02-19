[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / ShardLocator

# Class: ShardLocator<TClient, TField\>

Knows how to locate shard(s) based on various inputs. In some contexts, we
expect exactly one shard returned, and in other contexts, multiple shards are
okay.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |
| `TField` | extends `string` |

## Constructors

### constructor

• **new ShardLocator**<`TClient`, `TField`\>(`cluster`, `schemaName`, `shardAffinity`, `inverses`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md)<`TClient`\> |
| `TField` | extends `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `cluster` | [`Cluster`](Cluster.md)<`TClient`\> |
| `schemaName` | `string` |
| `shardAffinity` | [`ShardAffinity`](../modules.md#shardaffinity)<`TField`\> |
| `inverses` | [`Inverse`](Inverse.md)<`TClient`, `any`\>[] |

#### Defined in

[packages/ent-framework/src/ent/ShardLocator.ts:18](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/ShardLocator.ts#L18)

## Methods

### allShards

▸ **allShards**(): [`Shard`](Shard.md)<`TClient`\>[]

All shards for this particular Ent depending on its affinity.

#### Returns

[`Shard`](Shard.md)<`TClient`\>[]

#### Defined in

[packages/ent-framework/src/ent/ShardLocator.ts:137](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/ShardLocator.ts#L137)

___

### multiShardsFromInput

▸ **multiShardsFromInput**(`vc`, `input`, `op`): `Promise`<[`Shard`](Shard.md)<`TClient`\>[]\>

Called in a context when multiple shards may be involved, e.g. when
selecting Ents referred by some inverses. May also return the empty list of
shards in case there are fields with inverses in input (i.e. the filtering
is correct), but there are no inverses in the database.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | `Record`<`string`, `any`\> |
| `op` | `string` |

#### Returns

`Promise`<[`Shard`](Shard.md)<`TClient`\>[]\>

#### Defined in

[packages/ent-framework/src/ent/ShardLocator.ts:54](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/ShardLocator.ts#L54)

___

### singleShardFromID

▸ **singleShardFromID**(`field`, `id`): [`Shard`](Shard.md)<`TClient`\>

A wrapper for cluster.shard() which injects Ent name to the exception. This
is just a convenience for debugging.

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |
| `id` | `undefined` \| ``null`` \| `string` |

#### Returns

[`Shard`](Shard.md)<`TClient`\>

#### Defined in

[packages/ent-framework/src/ent/ShardLocator.ts:102](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/ShardLocator.ts#L102)

___

### singleShardFromInput

▸ **singleShardFromInput**(`input`, `op`, `allowRandomShard?`): [`Shard`](Shard.md)<`TClient`\>

Called in a context when we must know exactly 1 shard to work with (e.g.
INSERT, UPSERT etc.).

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `input` | `Record`<`string`, `any`\> | `undefined` |
| `op` | `string` | `undefined` |
| `allowRandomShard` | `boolean` | `false` |

#### Returns

[`Shard`](Shard.md)<`TClient`\>

#### Defined in

[packages/ent-framework/src/ent/ShardLocator.ts:29](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/ShardLocator.ts#L29)
