[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / AbstractIs

# Interface: AbstractIs\<TRow\>

Defined in: src/ent/predicates/AbstractIs.ts:6

A base interface for all user validation predicates.

## Extends

- [`Predicate`](Predicate.md)\<`TRow`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TRow` |

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="field"></a> `field` | `null` \| `string` | The field this validation predicate is related to (null means that it applies to the entire Ent). |
| <a id="message"></a> `message` | `null` \| `string` | In case the predicate returns false or doesn't provide error messages by throwing EntValidationError, this message will be used. When message is null, it means that we expect the validator to return detailed information about each field errored (e.g. ValidatorStandardSchemaResult). |
| <a id="name"></a> `name` | `string` | - |

## Methods

### check()

> **check**(`vc`, `input`): `Promise`\<`boolean`\>

Defined in: [src/ent/predicates/Predicate.ts:19](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Predicate.ts#L19)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | `TRow` |

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`Predicate`](Predicate.md).[`check`](Predicate.md#check)
