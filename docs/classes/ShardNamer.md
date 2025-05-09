[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ShardNamer

# Class: `abstract` ShardNamer

Defined in: src/abstract/ShardNamer.ts:19

Client-specific logic on how to synchronously convert an ID into Shard number
(only for the use cases when ID is prefixed with a Shard number), how to
build Shard names, and how to extract Shard number from a Shard name.

## Extended by

- [`PgShardNamer`](PgShardNamer.md)

## Constructors

### new ShardNamer()

> **new ShardNamer**(`options`): [`ShardNamer`](ShardNamer.md)

Defined in: src/abstract/ShardNamer.ts:34

Initializes an instance of ShardNamer.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ShardNamerOptions`](../interfaces/ShardNamerOptions.md) |

#### Returns

[`ShardNamer`](ShardNamer.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="shardnopadlen"></a> `shardNoPadLen` | `number` | Number of decimal digits in an ID allocated for Shard number. Calculated dynamically based on `ShardNamerOptions#nameFormat` (e.g. for "sh%04d", it will be 4 since it expands to "sh0012"). |
| <a id="options-1"></a> `options` | [`ShardNamerOptions`](../interfaces/ShardNamerOptions.md) | - |

## Methods

### shardNoByID()

> `abstract` **shardNoByID**(`id`): `number`

Defined in: src/abstract/ShardNamer.ts:24

Synchronously extracts Shard number from an ID prefix, for the use cases
where IDs have this information.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`number`

***

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
