[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Base64BufferType

# Function: Base64BufferType()

> **Base64BufferType**(): `object`

Defined in: [src/types.ts:392](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L392)

A value stored in the DB as a base64 encoded binary buffer. Actually, DB
engines (like PostgreSQL) support native binary data fields (and store binary
data efficiently), but sometimes (especially for small things, like
public/private keys), it's easier to store the binary data as base64 encoded
strings rather than dealing with the native binary data type.

## Returns

`object`

### dbValueToJs()

> **dbValueToJs**: (`dbValue`) => `Buffer`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dbValue` | `string` |

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
