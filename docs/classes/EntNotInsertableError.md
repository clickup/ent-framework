[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / EntNotInsertableError

# Class: EntNotInsertableError

Error: thrown when an Ent cannot be inserted due to privacy reasons.

## Hierarchy

- [`EntAccessError`](EntAccessError.md)

  ↳ **`EntNotInsertableError`**

## Constructors

### constructor

• **new EntNotInsertableError**(`entName`, `vc`, `row`, `cause?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `entName` | `string` | `undefined` |
| `vc` | `string` | `undefined` |
| `row` | `object` | `undefined` |
| `cause` | `unknown` | `null` |

#### Overrides

[EntAccessError](EntAccessError.md).[constructor](EntAccessError.md#constructor)

#### Defined in

[src/ent/errors/EntNotInsertableError.ts:7](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntNotInsertableError.ts#L7)

## Properties

### cause

• `Readonly` **cause**: ``null`` \| `string` \| `Error`

#### Inherited from

[EntAccessError](EntAccessError.md).[cause](EntAccessError.md#cause)

#### Defined in

[src/ent/errors/EntAccessError.ts:9](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntAccessError.ts#L9)

___

### entName

• `Readonly` **entName**: `string`

#### Inherited from

[EntAccessError](EntAccessError.md).[entName](EntAccessError.md#entname)

#### Defined in

[src/ent/errors/EntAccessError.ts:12](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntAccessError.ts#L12)

___

### vc

• `Readonly` **vc**: `string`

#### Defined in

[src/ent/errors/EntNotInsertableError.ts:9](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntNotInsertableError.ts#L9)

___

### row

• `Readonly` **row**: `object`

#### Defined in

[src/ent/errors/EntNotInsertableError.ts:10](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntNotInsertableError.ts#L10)
