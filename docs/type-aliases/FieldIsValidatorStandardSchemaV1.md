[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / FieldIsValidatorStandardSchemaV1

# Type Alias: FieldIsValidatorStandardSchemaV1()\<TRow\>

> **FieldIsValidatorStandardSchemaV1**\<`TRow`\>: (`fieldValue`, `row`, `vc`) => [`ValidatorStandardSchemaResult`](ValidatorStandardSchemaResult.md) \| `Promise`\<[`ValidatorStandardSchemaResult`](ValidatorStandardSchemaResult.md)\>

Defined in: [src/ent/predicates/FieldIs.ts:34](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L34)

A field validator function that returns a Standard Schema validation result.

## Type Parameters

| Type Parameter |
| ------ |
| `TRow` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `fieldValue` | `unknown` |
| `row` | `TRow` |
| `vc` | [`VC`](../classes/VC.md) |

## Returns

[`ValidatorStandardSchemaResult`](ValidatorStandardSchemaResult.md) \| `Promise`\<[`ValidatorStandardSchemaResult`](ValidatorStandardSchemaResult.md)\>
