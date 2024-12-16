[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntAccessError

# Class: EntAccessError

A base class for errors which trigger the validation framework to process
them as a DENY/SKIP.

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

#### Defined in

[src/ent/errors/EntAccessError.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L10)

## Properties

| Property | Type |
| ------ | ------ |
| `cause` | `null` \| `string` \| `Error` |
| `entName` | `string` |
