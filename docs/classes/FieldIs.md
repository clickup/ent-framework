[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / FieldIs

# Class: FieldIs\<TField, TRow\>

Defined in: [src/ent/predicates/FieldIs.ts:43](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L43)

Checks that the validator function returns true for the value in some field.

## Type Parameters

| Type Parameter |
| ------ |
| `TField` *extends* `string` |
| `TRow` *extends* `Partial`\<`Record`\<`TField`, `unknown`\>\> |

## Implements

- [`AbstractIs`](../interfaces/AbstractIs.md)\<`TRow`\>

## Constructors

### new FieldIs()

> **new FieldIs**\<`TField`, `TRow`\>(`field`, `validator`, `message`): [`FieldIs`](FieldIs.md)\<`TField`, `TRow`\>

Defined in: [src/ent/predicates/FieldIs.ts:56](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L56)

Manual validator. Implies that we can trust the fieldValue TS type.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | `TField` |
| `validator` | [`FieldIsValidatorPlain`](../type-aliases/FieldIsValidatorPlain.md)\<`TField`, `TRow`\> |
| `message` | `string` |

#### Returns

[`FieldIs`](FieldIs.md)\<`TField`, `TRow`\>

### new FieldIs()

> **new FieldIs**\<`TField`, `TRow`\>(`field`, `validator`): [`FieldIs`](FieldIs.md)\<`TField`, `TRow`\>

Defined in: [src/ent/predicates/FieldIs.ts:66](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L66)

Rich validator, like Standard Schema (https://standardschema.dev) or Zod.
No implications are made on the fieldValue type.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | `TField` |
| `validator` | [`FieldIsValidatorZodSafeParse`](../type-aliases/FieldIsValidatorZodSafeParse.md)\<`TRow`\> \| [`FieldIsValidatorStandardSchemaV1`](../type-aliases/FieldIsValidatorStandardSchemaV1.md)\<`TRow`\> |

#### Returns

[`FieldIs`](FieldIs.md)\<`TField`, `TRow`\>

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="name"></a> `name` | `string` | - |
| <a id="field-2"></a> `field` | `TField` | The field this validation predicate is related to (null means that it applies to the entire Ent). |
| <a id="message-1"></a> `message` | `null` \| `string` | In case the predicate returns false or doesn't provide error messages by throwing EntValidationError, this message will be used. When message is null, it means that we expect the validator to return detailed information about each field errored (e.g. ValidatorStandardSchemaResult). |
| <a id="validator-2"></a> `validator` | [`FieldIsValidatorPlain`](../type-aliases/FieldIsValidatorPlain.md)\<`TField`, `TRow`\> \| [`FieldIsValidatorZodSafeParse`](../type-aliases/FieldIsValidatorZodSafeParse.md)\<`TRow`\> \| [`FieldIsValidatorStandardSchemaV1`](../type-aliases/FieldIsValidatorStandardSchemaV1.md)\<`TRow`\> | - |

## Methods

### check()

> **check**(`vc`, `row`): `Promise`\<`boolean`\>

Defined in: [src/ent/predicates/FieldIs.ts:93](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L93)

Returns true if validation succeeds. Returns false if it wants the client
to use this.message as a validation failure response. Throws an instance of
EntValidationError when it needs to deliver the detailed error messages
about multiple fields.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | `TRow` |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`AbstractIs`](../interfaces/AbstractIs.md).[`check`](../interfaces/AbstractIs.md#check)
