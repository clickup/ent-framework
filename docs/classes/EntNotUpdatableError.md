[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / EntNotUpdatableError

# Class: EntNotUpdatableError

Error: thrown when an Ent cannot be updated or deleted due to privacy reasons.

## Hierarchy

- [`EntAccessError`](EntAccessError.md)

  ↳ **`EntNotUpdatableError`**

## Constructors

### constructor

• **new EntNotUpdatableError**(`entName`, `vc`, `row`, `cause?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `entName` | `string` | `undefined` |
| `vc` | `string` | `undefined` |
| `row` | [`RowWithID`](../modules.md#rowwithid) | `undefined` |
| `cause` | `unknown` | `null` |

#### Overrides

[EntAccessError](EntAccessError.md).[constructor](EntAccessError.md#constructor)

#### Defined in

[src/ent/errors/EntNotUpdatableError.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotUpdatableError.ts#L9)

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

### vc

• `Readonly` **vc**: `string`

#### Defined in

[src/ent/errors/EntNotUpdatableError.ts:11](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotUpdatableError.ts#L11)

___

### row

• `Readonly` **row**: [`RowWithID`](../modules.md#rowwithid)

#### Defined in

[src/ent/errors/EntNotUpdatableError.ts:12](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotUpdatableError.ts#L12)
