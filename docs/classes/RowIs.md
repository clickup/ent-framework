[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / RowIs

# Class: RowIs\<TRow\>

Defined in: [src/ent/predicates/RowIs.ts:37](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/RowIs.ts#L37)

Checks that the validator function returns true for the entire row.

## Type Parameters

| Type Parameter |
| ------ |
| `TRow` |

## Implements

- [`AbstractIs`](../interfaces/AbstractIs.md)\<`TRow`\>

## Constructors

### new RowIs()

> **new RowIs**\<`TRow`\>(`validator`, `message`): [`RowIs`](RowIs.md)\<`TRow`\>

Defined in: [src/ent/predicates/RowIs.ts:46](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/RowIs.ts#L46)

Manual validator.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `validator` | [`RowIsValidatorPlain`](../type-aliases/RowIsValidatorPlain.md)\<`TRow`\> |
| `message` | `string` |

#### Returns

[`RowIs`](RowIs.md)\<`TRow`\>

### new RowIs()

> **new RowIs**\<`TRow`\>(`validator`): [`RowIs`](RowIs.md)\<`TRow`\>

Defined in: [src/ent/predicates/RowIs.ts:51](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/RowIs.ts#L51)

Rich validator, like Standard Schema (https://standardschema.dev) or Zod.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `validator` | [`RowIsValidatorZodSafeParse`](../type-aliases/RowIsValidatorZodSafeParse.md)\<`TRow`\> \| [`RowIsValidatorStandardSchemaV1`](../type-aliases/RowIsValidatorStandardSchemaV1.md)\<`TRow`\> |

#### Returns

[`RowIs`](RowIs.md)\<`TRow`\>

## Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="name"></a> `name` | `string` | `undefined` | - |
| <a id="field"></a> `field` | `null` | `null` | The field this validation predicate is related to (null means that it applies to the entire Ent). |
| <a id="message-1"></a> `message` | `null` \| `string` | `undefined` | In case the predicate returns false or doesn't provide error messages by throwing EntValidationError, this message will be used. When message is null, it means that we expect the validator to return detailed information about each field errored (e.g. ValidatorStandardSchemaResult). |
| <a id="validator-2"></a> `validator` | [`RowIsValidatorPlain`](../type-aliases/RowIsValidatorPlain.md)\<`TRow`\> \| [`RowIsValidatorZodSafeParse`](../type-aliases/RowIsValidatorZodSafeParse.md)\<`TRow`\> \| [`RowIsValidatorStandardSchemaV1`](../type-aliases/RowIsValidatorStandardSchemaV1.md)\<`TRow`\> | `undefined` | - |

## Methods

### check()

> **check**(`vc`, `row`): `Promise`\<`boolean`\>

Defined in: [src/ent/predicates/RowIs.ts:75](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/RowIs.ts#L75)

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
