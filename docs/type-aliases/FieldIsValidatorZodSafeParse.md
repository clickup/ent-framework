[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / FieldIsValidatorZodSafeParse

# Type Alias: FieldIsValidatorZodSafeParse()\<TRow\>

> **FieldIsValidatorZodSafeParse**\<`TRow`\>: (`fieldValue`, `row`, `vc`) => [`ValidatorZodSafeParseResult`](ValidatorZodSafeParseResult.md) \| `Promise`\<[`ValidatorZodSafeParseResult`](ValidatorZodSafeParseResult.md)\>

Defined in: [src/ent/predicates/FieldIs.ts:25](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L25)

A field validator function that returns a Zod result.

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

[`ValidatorZodSafeParseResult`](ValidatorZodSafeParseResult.md) \| `Promise`\<[`ValidatorZodSafeParseResult`](ValidatorZodSafeParseResult.md)\>
