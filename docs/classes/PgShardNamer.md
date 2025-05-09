[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgShardNamer

# Class: PgShardNamer

Defined in: src/pg/PgShardNamer.ts:9

ShardNamer implementation for PG.

## Extends

- [`ShardNamer`](ShardNamer.md)

## Constructors

### new PgShardNamer()

> **new PgShardNamer**(`options`): [`PgShardNamer`](PgShardNamer.md)

Defined in: src/abstract/ShardNamer.ts:34

Initializes an instance of ShardNamer.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ShardNamerOptions`](../interfaces/ShardNamerOptions.md) |

#### Returns

[`PgShardNamer`](PgShardNamer.md)

#### Inherited from

[`ShardNamer`](ShardNamer.md).[`constructor`](ShardNamer.md#constructors)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="shardnopadlen"></a> `shardNoPadLen` | `number` | Number of decimal digits in an ID allocated for Shard number. Calculated dynamically based on `ShardNamerOptions#nameFormat` (e.g. for "sh%04d", it will be 4 since it expands to "sh0012"). |
| <a id="options-1"></a> `options` | [`ShardNamerOptions`](../interfaces/ShardNamerOptions.md) | - |

## Methods

### shardNoByName()

> **shardNoByName**(`name`): `null` \| `number`

Defined in: src/abstract/ShardNamer.ts:46

Converts a Shard name to Shard number. Returns null if it's not a correct
Shard name.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

#### Returns

`null` \| `number`

#### Inherited from

[`ShardNamer`](ShardNamer.md).[`shardNoByName`](ShardNamer.md#shardnobyname)

***

### shardNameByNo()

> **shardNameByNo**(`no`): `string`

Defined in: src/abstract/ShardNamer.ts:58

Builds the Shard name (e.g. for PG, "schema name") by Shard number using
`ShardNamerOptions#nameFormat`.

E.g. nameFormat="sh%04d" generates names like "sh0042".

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `no` | `number` |

#### Returns

`string`

#### Inherited from

[`ShardNamer`](ShardNamer.md).[`shardNameByNo`](ShardNamer.md#shardnamebyno)

***

### shardNoByID()

> **shardNoByID**(`id`): `number`

Defined in: src/pg/PgShardNamer.ts:14

Synchronously extracts Shard number from an ID. Can also extract from PG
composite rows (to support composite IDs).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`number`

#### Overrides

[`ShardNamer`](ShardNamer.md).[`shardNoByID`](ShardNamer.md#shardnobyid)
