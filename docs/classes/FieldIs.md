[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / FieldIs

# Class: FieldIs\<TField, TRow\>

Defined in: [src/ent/predicates/FieldIs.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L8)

Checks that the validator function returns true for the value in some field.

## Type Parameters

| Type Parameter |
| ------ |
| `TField` *extends* `string` |
| `TRow` *extends* `Partial`\<`Record`\<`TField`, `unknown`\>\> |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`TRow`\>
- [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)

## Constructors

### new FieldIs()

> **new FieldIs**\<`TField`, `TRow`\>(`field`, `validator`, `message`): [`FieldIs`](FieldIs.md)\<`TField`, `TRow`\>

Defined in: [src/ent/predicates/FieldIs.ts:16](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L16)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | `TField` |
| `validator` | (`fieldValue`, `row`, `vc`) => `boolean` \| `Promise`\<`boolean`\> |
| `message` | `string` |

#### Returns

[`FieldIs`](FieldIs.md)\<`TField`, `TRow`\>

## Properties

| Property | Type |
| ------ | ------ |
| <a id="name"></a> `name` | `string` |
| <a id="field-1"></a> `field` | `TField` |
| <a id="validator-1"></a> `validator` | (`fieldValue`: `TRow`\[`TField`\], `row`: `TRow`, `vc`: [`VC`](VC.md)) => `boolean` \| `Promise`\<`boolean`\> |
| <a id="message-1"></a> `message` | `string` |

## Methods

### check()

> **check**(`vc`, `row`): `Promise`\<`boolean`\>

Defined in: [src/ent/predicates/FieldIs.ts:28](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L28)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | `TRow` |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)
