[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / RowIsValidatorZodSafeParse

# Type Alias: RowIsValidatorZodSafeParse()\<TRow\>

> **RowIsValidatorZodSafeParse**\<`TRow`\>: (`row`, `vc`) => [`ValidatorZodSafeParseResult`](ValidatorZodSafeParseResult.md) \| `Promise`\<[`ValidatorZodSafeParseResult`](ValidatorZodSafeParseResult.md)\>

Defined in: src/ent/predicates/RowIs.ts:21

A row validator function that returns a Zod result.

## Type Parameters

| Type Parameter |
| ------ |
| `TRow` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `row` | `TRow` |
| `vc` | [`VC`](../classes/VC.md) |

## Returns

[`ValidatorZodSafeParseResult`](ValidatorZodSafeParseResult.md) \| `Promise`\<[`ValidatorZodSafeParseResult`](ValidatorZodSafeParseResult.md)\>
