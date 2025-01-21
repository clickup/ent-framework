[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntValidationError

# Class: EntValidationError

Defined in: [src/ent/errors/EntValidationError.ts:7](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntValidationError.ts#L7)

Error: thrown after all validators are executed, and some of them think that
the row is invalid.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntValidationError()

> **new EntValidationError**(`entName`, `errors`): [`EntValidationError`](EntValidationError.md)

Defined in: [src/ent/errors/EntValidationError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntValidationError.ts#L8)

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
