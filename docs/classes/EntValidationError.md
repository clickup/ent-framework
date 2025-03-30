[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntValidationError

# Class: EntValidationError

Defined in: [src/ent/errors/EntValidationError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntValidationError.ts#L8)

Error: thrown after all validators are executed, and some of them think that
the row is invalid.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntValidationError()

> **new EntValidationError**(`entName`, `errors`): [`EntValidationError`](EntValidationError.md)

Defined in: [src/ent/errors/EntValidationError.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntValidationError.ts#L9)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `entName` | `string` |
| `errors` | readonly [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[] |

#### Returns

[`EntValidationError`](EntValidationError.md)

#### Overrides

[`EntAccessError`](EntAccessError.md).[`constructor`](EntAccessError.md#constructors)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="cause"></a> `cause` | `null` \| `string` \| `Error` |
| <a id="entname-1"></a> `entName` | `string` |
| <a id="errors-1"></a> `errors` | readonly [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[] |

## Methods

### toStandardSchemaV1()

> **toStandardSchemaV1**(): [`StandardSchemaV1FailureResult`](../interfaces/StandardSchemaV1FailureResult.md)

Defined in: [src/ent/errors/EntValidationError.ts:27](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntValidationError.ts#L27)

Converts the payload to a Standard Schema V1 compatible error result. See
https://standardschema.dev.

#### Returns

[`StandardSchemaV1FailureResult`](../interfaces/StandardSchemaV1FailureResult.md)

#### Overrides

[`EntAccessError`](EntAccessError.md).[`toStandardSchemaV1`](EntAccessError.md#tostandardschemav1)
