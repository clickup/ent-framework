[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ByteaBuffer

# Function: ByteaBuffer()

> **ByteaBuffer**(): `object`

Defined in: src/pg/types/ByteaBuffer.ts:6

A value stored in the DB as a bytea buffer.

## Returns

`object`

### dbValueToJs()

> **dbValueToJs**: (`dbValue`) => `Buffer`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dbValue` | `Buffer` |

#### Returns

`Buffer`

### stringify()

> **stringify**: (`jsValue`) => `string`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `jsValue` | `Buffer` |

#### Returns

`string`

### parse()

> **parse**: (`str`) => `Buffer`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

`Buffer`
