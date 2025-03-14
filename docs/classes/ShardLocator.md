[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ShardLocator

# Class: ShardLocator\<TClient, TTable, TField\>

Defined in: [src/ent/ShardLocator.ts:21](https://github.com/clickup/ent-framework/blob/master/src/ent/ShardLocator.ts#L21)

Knows how to locate Shard(s) based on various inputs. In some contexts, we
expect exactly one Shard returned, and in other contexts, multiple Shards are
okay.

## Type Parameters

| Type Parameter |
| ------ |
| `TClient` *extends* [`Client`](Client.md) |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TField` *extends* `string` |

## Constructors

### new ShardLocator()

> **new ShardLocator**\<`TClient`, `TTable`, `TField`\>(`__namedParameters`): [`ShardLocator`](ShardLocator.md)\<`TClient`, `TTable`, `TField`\>

Defined in: [src/ent/ShardLocator.ts:34](https://github.com/clickup/ent-framework/blob/master/src/ent/ShardLocator.ts#L34)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | \{ `cluster`: [`Cluster`](Cluster.md)\<`TClient`, `any`\>; `entName`: `string`; `shardAffinity`: [`ShardAffinity`](../type-aliases/ShardAffinity.md)\<`TField`\>; `uniqueKey`: `undefined` \| readonly `string`[]; `inverses`: readonly [`Inverse`](Inverse.md)\<`TClient`, `TTable`\>[]; \} |
| `__namedParameters.cluster` | [`Cluster`](Cluster.md)\<`TClient`, `any`\> |
| `__namedParameters.entName` | `string` |
| `__namedParameters.shardAffinity` | [`ShardAffinity`](../type-aliases/ShardAffinity.md)\<`TField`\> |
| `__namedParameters.uniqueKey` | `undefined` \| readonly `string`[] |
| `__namedParameters.inverses` | readonly [`Inverse`](Inverse.md)\<`TClient`, `TTable`\>[] |

#### Returns

[`ShardLocator`](ShardLocator.md)\<`TClient`, `TTable`, `TField`\>

## Methods

### singleShardForInsert()

> **singleShardForInsert**(`input`, `op`): `Promise`\<[`Shard`](Shard.md)\<`TClient`\>\>

Defined in: [src/ent/ShardLocator.ts:76](https://github.com/clickup/ent-framework/blob/master/src/ent/ShardLocator.ts#L76)

Called in a context when we must know exactly 1 Shard to work with (e.g.
INSERT, UPSERT etc.). If op === "insert" (fallback to random Shard), then
returns a random Shard in case when it can't infer the Shard number from
the input (used in e.g. INSERT operations); otherwise throws ShardError
(happens in e.g. UPSERT).

The "randomness" of the "random Shard" is deterministic by the Ent's unique
key (if it's defined), so Ents with the same unique key will map to the
same "random" Shard (considering the total number of discovered Shards is
unchanged). Notice that this logic applies at INSERT time: since we often
times add Shards to the Cluster, we can't rely on it consistently at SELECT
time (but relying at INSERT time is more or less fine: it protects against
most of "unique key violation" problems, although still doesn't prevent all
of them for a fraction of the second when the number of Shards has just
been changed).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `Record`\<`string`, `unknown`\> |
| `op` | `"insert"` \| `"upsert"` |

#### Returns

`Promise`\<[`Shard`](Shard.md)\<`TClient`\>\>

***

### multiShardsFromInput()

> **multiShardsFromInput**(`vc`, `input`, `op`): `Promise`\<[`Shard`](Shard.md)\<`TClient`\>[]\>

Defined in: [src/ent/ShardLocator.ts:110](https://github.com/clickup/ent-framework/blob/master/src/ent/ShardLocator.ts#L110)

Called in a context when multiple Shards may be involved, e.g. when
selecting Ents referred by some Inverses. May also return the empty list of
Shards when, although there are fields with Inverses in input (i.e. the
filtering is correct), there are no Inverse rows existing in the database.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `input` | `Record`\<`string`, `unknown`\> |
| `op` | `string` |

#### Returns

`Promise`\<[`Shard`](Shard.md)\<`TClient`\>[]\>

***

### singleShardFromID()

> **singleShardFromID**(`field`, `id`, `op`): `Promise`\<`null` \| [`Shard`](Shard.md)\<`TClient`\>\>

Defined in: [src/ent/ShardLocator.ts:182](https://github.com/clickup/ent-framework/blob/master/src/ent/ShardLocator.ts#L182)

A wrapper for Cluster#shard() which injects Ent name to the exception (in
case of e.g. "Cannot locate Shard" exception). This is just a convenience
for debugging.

If this method returns null, that means the caller should give up trying to
load the Ent with this ID, because it won't find it anyways (e.g. when we
try to load a sharded Ent using an ID from the global Shard). This is
identical to the case of an Ent not existing in the database.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | `string` |
| `id` | `undefined` \| `null` \| `string` |
| `op` | `string` |

#### Returns

`Promise`\<`null` \| [`Shard`](Shard.md)\<`TClient`\>\>

***

### allShards()

> **allShards**(): `Promise`\<readonly [`Shard`](Shard.md)\<`TClient`\>[]\>

Defined in: [src/ent/ShardLocator.ts:239](https://github.com/clickup/ent-framework/blob/master/src/ent/ShardLocator.ts#L239)

All shards for this particular Ent depending on its affinity.

#### Returns

`Promise`\<readonly [`Shard`](Shard.md)\<`TClient`\>[]\>
