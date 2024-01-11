[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / EntValidationError

# Class: EntValidationError

Error: thrown after all validators are executed, and some of them think that
the row is invalid.

## Hierarchy

- [`EntAccessError`](EntAccessError.md)

  ↳ **`EntValidationError`**

## Constructors

### constructor

• **new EntValidationError**(`entName`, `errors`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `entName` | `string` |
| `errors` | readonly [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[] |

#### Overrides

[EntAccessError](EntAccessError.md).[constructor](EntAccessError.md#constructor)

#### Defined in

[src/ent/errors/EntValidationError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntValidationError.ts#L8)

## Properties

### cause

• `Readonly` **cause**: ``null`` \| `string` \| `Error`

#### Inherited from

[EntAccessError](EntAccessError.md).[cause](EntAccessError.md#cause)

#### Defined in

[src/ent/errors/EntAccessError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L8)

___

### entName

• `Readonly` **entName**: `string`

#### Inherited from

[EntAccessError](EntAccessError.md).[entName](EntAccessError.md#entname)

#### Defined in

[src/ent/errors/EntAccessError.ts:11](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntAccessError.ts#L11)

___

### errors

• `Readonly` **errors**: readonly [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[]

#### Defined in

[src/ent/errors/EntValidationError.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntValidationError.ts#L10)
