[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / EntAccessError

# Class: EntAccessError

A base class for errors which trigger the validation framework to process
them as a DENY/SKIP.

## Hierarchy

- `Error`

  ↳ **`EntAccessError`**

  ↳↳ [`EntNotFoundError`](EntNotFoundError.md)

  ↳↳ [`EntNotInsertableError`](EntNotInsertableError.md)

  ↳↳ [`EntNotReadableError`](EntNotReadableError.md)

  ↳↳ [`EntNotUpdatableError`](EntNotUpdatableError.md)

  ↳↳ [`EntValidationError`](EntValidationError.md)

## Constructors

### constructor

• **new EntAccessError**(`entName`, `message`, `cause?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `entName` | `string` | `undefined` |
| `message` | `string` | `undefined` |
| `cause` | `unknown` | `null` |

#### Overrides

Error.constructor

#### Defined in

[src/ent/errors/EntAccessError.ts:11](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntAccessError.ts#L11)

## Properties

### cause

• `Readonly` **cause**: ``null`` \| `string` \| `Error`

#### Defined in

[src/ent/errors/EntAccessError.ts:9](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntAccessError.ts#L9)

___

### entName

• `Readonly` **entName**: `string`

#### Defined in

[src/ent/errors/EntAccessError.ts:12](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntAccessError.ts#L12)
