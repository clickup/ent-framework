[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / BigIntArrayType

# Function: BigIntArrayType()

> **BigIntArrayType**(): `object`

Defined in: [src/pg/types/BigIntArrayType.ts:18](https://github.com/clickup/ent-framework/blob/master/src/pg/types/BigIntArrayType.ts#L18)

An array of IDs. Notice that:
1. Node-postgres natively supports this type on read path, but on write path,
   we have to stringify by ourselves.
2. GIN index doesn't support NULL, because PG's "&&" operator (intersection
   check) doesn't work with NULLs. But we still allow NULLs in BigIntArrayType,
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
