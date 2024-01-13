[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / EntNotFoundError

# Class: EntNotFoundError

Error: non-existing ID in the database.

## Hierarchy

- [`EntAccessError`](EntAccessError.md)

  ↳ **`EntNotFoundError`**

## Constructors

### constructor

• **new EntNotFoundError**(`entName`, `where`, `cause?`): [`EntNotFoundError`](EntNotFoundError.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `entName` | `string` | `undefined` |
| `where` | `Record`\<`string`, `unknown`\> | `undefined` |
| `cause` | `unknown` | `null` |

#### Returns

[`EntNotFoundError`](EntNotFoundError.md)

#### Overrides

[EntAccessError](EntAccessError.md).[constructor](EntAccessError.md#constructor)

#### Defined in

[src/ent/errors/EntNotFoundError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotFoundError.ts#L8)

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

### where

• `Readonly` **where**: `Record`\<`string`, `unknown`\>

#### Defined in

[src/ent/errors/EntNotFoundError.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntNotFoundError.ts#L10)
