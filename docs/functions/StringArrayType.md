[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / StringArrayType

# Function: StringArrayType()

> **StringArrayType**\<`T`\>(): `object`

Defined in: [src/pg/types/StringArrayType.ts:14](https://github.com/clickup/ent-framework/blob/master/src/pg/types/StringArrayType.ts#L14)

An array of Strings. Note: node-postgres natively supports this type on read
path, but on write path, we have to stringify by ourselves.

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
