[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / EntValidationError

# Class: EntValidationError

Error: thrown after all validators are executed, and some of them think that
the row is invalid.

## Extends

- [`EntAccessError`](EntAccessError.md)

## Constructors

### new EntValidationError()

> **new EntValidationError**(`entName`, `errors`): [`EntValidationError`](EntValidationError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `entName` | `string` |
| `errors` | readonly [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[] |

#### Returns

[`EntValidationError`](EntValidationError.md)

#### Overrides

[`EntAccessError`](EntAccessError.md).[`constructor`](EntAccessError.md#constructors)

#### Defined in

[src/ent/errors/EntValidationError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntValidationError.ts#L8)

## Properties

| Property | Type |
| ------ | ------ |
| `cause` | `null` \| `string` \| `Error` |
| `entName` | `string` |
| `errors` | readonly [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[] |
