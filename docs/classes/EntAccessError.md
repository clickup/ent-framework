[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntAccessError

# Class: EntAccessError

Defined in: [src/ent/errors/EntAccessError.ts:7](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L7)

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

Defined in: [src/ent/errors/EntAccessError.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L10)

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
