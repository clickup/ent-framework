[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / EntNotReadableError

# Class: EntNotReadableError

Error: thrown when an Ent cannot be read due to privacy reasons.

## Hierarchy

- [`EntAccessError`](EntAccessError.md)

  ↳ **`EntNotReadableError`**

## Constructors

### constructor

• **new EntNotReadableError**(`entName`, `vc`, `row`, `cause?`)

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

[src/ent/errors/EntNotReadableError.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotReadableError.ts#L9)

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

[src/ent/errors/EntNotReadableError.ts:11](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotReadableError.ts#L11)

___

### row

• `Readonly` **row**: [`RowWithID`](../modules.md#rowwithid)

#### Defined in

[src/ent/errors/EntNotReadableError.ts:12](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotReadableError.ts#L12)
