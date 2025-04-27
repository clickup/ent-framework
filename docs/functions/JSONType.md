[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / JSONType

# Function: JSONType()

> **JSONType**\<`TCurrent`\>(): `object`

Defined in: [src/types.ts:418](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L418)

An arbitrary JSON field type.

## Type Parameters

| Type Parameter |
| ------ |
| `TCurrent` *extends* [`JSONValue`](../type-aliases/JSONValue.md) |

## Returns

`object`

### dbValueToJs()

> **dbValueToJs**: (`dbValue`) => `TCurrent`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dbValue` | `TCurrent` |

#### Returns

`TCurrent`

### stringify()

> **stringify**: (`jsValue`) => `string`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `jsValue` | `TCurrent` |

#### Returns

`string`

### parse()

> **parse**: (`str`) => `TCurrent`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

`TCurrent`
