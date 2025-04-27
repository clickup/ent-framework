[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / StringArrayType

# Function: StringArrayType()

> **StringArrayType**(): `object`

Defined in: src/pg/types/StringArrayType.ts:13

An array of Strings. Note: node-postgres natively supports this type on read
path, but on write path, we have to stringify by ourselves.

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
