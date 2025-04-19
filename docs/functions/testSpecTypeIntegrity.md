[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / testSpecTypeIntegrity

# Function: testSpecTypeIntegrity()

> **testSpecTypeIntegrity**\<`TDBValue`, `TJsValue`\>(`SpecType`, `dbValue`): `object`

Defined in: src/helpers/testSpecTypeIntegrity.ts:9

A tool to verify integrity of custom field types. It is meant to be called
from Jest expect(). The helper runs dbValueToJs, stringify and parse methods
on the type and makes sure that parse() is the opposite of stringify(). The
returned object can then be compared against a Jest snapshot.

## Type Parameters

| Type Parameter |
| ------ |
| `TDBValue` |
| `TJsValue` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `SpecType` | \{ `dbValueToJs`: (`dbValue`) => `TJsValue`; `stringify`: (`jsValue`) => `string`; `parse`: (`str`) => `TJsValue`; \} |
| `SpecType.dbValueToJs` | (`dbValue`) => `TJsValue` |
| `SpecType.stringify` | (`jsValue`) => `string` |
| `SpecType.parse` | (`str`) => `TJsValue` |
| `dbValue` | `TDBValue` |

## Returns

`object`

### jsValueDecoded

> **jsValueDecoded**: `TJsValue`

### stringifiedBack

> **stringifiedBack**: `string`
