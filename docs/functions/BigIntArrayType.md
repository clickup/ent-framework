[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / BigIntArrayType

# Function: BigIntArrayType()

> **BigIntArrayType**\<`T`\>(): `object`

Defined in: [src/pg/types/BigIntArrayType.ts:19](https://github.com/clickup/ent-framework/blob/master/src/pg/types/BigIntArrayType.ts#L19)

An array of IDs. Notice that:
1. Node-postgres natively supports this type on read path, but on write path,
   we have to stringify by ourselves.
2. GIN index doesn't support NULL, because PG's "&&" operator (intersection
   check) doesn't work with NULLs. But we still allow NULLs in
   BigIntArrayType, since to query such values, the user could use a separate
   partial index.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `null` \| `string` | `null` \| `string` |

## Returns

`object`

### dbValueToJs()

> **dbValueToJs**: (`dbValue`) => `T`[]

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dbValue` | `T`[] |

#### Returns

`T`[]

### stringify()

> **stringify**: (`jsValue`) => `string`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `jsValue` | `T`[] |

#### Returns

`string`

### parse()

> **parse**: (`str`) => `T`[]

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

`T`[]
