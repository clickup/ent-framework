[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / FieldIsValidatorPlain

# Type Alias: FieldIsValidatorPlain()\<TField, TRow\>

> **FieldIsValidatorPlain**\<`TField`, `TRow`\>: (`fieldValue`, `row`, `vc`) => [`ValidatorPlainResult`](ValidatorPlainResult.md) \| `Promise`\<[`ValidatorPlainResult`](ValidatorPlainResult.md)\>

Defined in: [src/ent/predicates/FieldIs.ts:13](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L13)

A field validator function that returns a boolean.

## Type Parameters

| Type Parameter |
| ------ |
| `TField` *extends* `string` |
| `TRow` *extends* `Partial`\<`Record`\<`TField`, `unknown`\>\> |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `fieldValue` | `TRow`\[`TField`\] |
| `row` | `TRow` |
| `vc` | [`VC`](../classes/VC.md) |

## Returns

[`ValidatorPlainResult`](ValidatorPlainResult.md) \| `Promise`\<[`ValidatorPlainResult`](ValidatorPlainResult.md)\>
