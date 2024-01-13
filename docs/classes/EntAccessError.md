[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / EntAccessError

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

• **new EntAccessError**(`entName`, `message`, `cause?`): [`EntAccessError`](EntAccessError.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `entName` | `string` | `undefined` |
| `message` | `string` | `undefined` |
| `cause` | `unknown` | `null` |

#### Returns

[`EntAccessError`](EntAccessError.md)

#### Overrides

Error.constructor

#### Defined in

[src/ent/errors/EntAccessError.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L10)

## Properties

### cause

• `Readonly` **cause**: ``null`` \| `string` \| `Error`

#### Defined in

[src/ent/errors/EntAccessError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L8)

___

### entName

• `Readonly` **entName**: `string`

#### Defined in

[src/ent/errors/EntAccessError.ts:11](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L11)
