[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntAccessError

# Class: EntAccessError

Defined in: [src/ent/errors/EntAccessError.ts:22](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L22)

A base class for errors that trigger the validation framework to process them
as a DENY/SKIP. Invariants in derived classes: the error message should be
safe to pass to the client (it must not have any private information; a good
example is EntValidationError), plus the message alone should be descriptive
enough to extract information from it. If `cause` is passed, it becomes a
part of the message, with the above assumptions.

## Extends

- `Error`

## Extended by

- [`EntNotFoundError`](EntNotFoundError.md)
- [`EntNotInsertableError`](EntNotInsertableError.md)
- [`EntNotReadableError`](EntNotReadableError.md)
- [`EntNotUpdatableError`](EntNotUpdatableError.md)
- [`EntValidationError`](EntValidationError.md)

## Constructors

### new EntAccessError()

> **new EntAccessError**(`entName`, `message`, `cause`): [`EntAccessError`](EntAccessError.md)

Defined in: [src/ent/errors/EntAccessError.ts:25](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L25)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `entName` | `string` | `undefined` |
| `message` | `string` | `undefined` |
| `cause` | `unknown` | `null` |

#### Returns

[`EntAccessError`](EntAccessError.md)

#### Overrides

`Error.constructor`

## Properties

| Property | Type |
| ------ | ------ |
| <a id="cause-1"></a> `cause` | `null` \| `string` \| `Error` |
| <a id="entname-1"></a> `entName` | `string` |

## Methods

### toStandardSchemaV1()

> **toStandardSchemaV1**(): [`StandardSchemaV1FailureResult`](../interfaces/StandardSchemaV1FailureResult.md)

Defined in: [src/ent/errors/EntAccessError.ts:52](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L52)

#### Returns

[`StandardSchemaV1FailureResult`](../interfaces/StandardSchemaV1FailureResult.md)
