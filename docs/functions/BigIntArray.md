[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / BigIntArray

# Function: BigIntArray()

> **BigIntArray**(): `object`

Defined in: src/pg/types/BigIntArray.ts:17

An array of IDs. Notice that:
1. Node-postgres natively supports this type on read path, but on write path,
   we have to stringify by ourselves.
2. GIN index doesn't support NULL, because PG's "&&" operator (intersection
   check) doesn't work with NULLs. But we still allow NULLs in BigIntArray,
   because to query such values, we can use a separate partial index.

## Returns

`object`

### dbValueToJs()

> **dbValueToJs**: (`dbValue`) => (`string` \| `null`)[]

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dbValue` | (`string` \| `null`)[] |

#### Returns

(`string` \| `null`)[]

### stringify()

> **stringify**: (`jsValue`) => `string`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `jsValue` | (`string` \| `null`)[] |

#### Returns

`string`

### parse()

> **parse**: (`str`) => (`string` \| `null`)[]

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

(`string` \| `null`)[]
