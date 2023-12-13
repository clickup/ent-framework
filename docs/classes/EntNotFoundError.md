[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / EntNotFoundError

# Class: EntNotFoundError

Error: non-existing ID in the database.

## Hierarchy

- [`EntAccessError`](EntAccessError.md)

  ↳ **`EntNotFoundError`**

## Constructors

### constructor

• **new EntNotFoundError**(`entName`, `where`, `cause?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `entName` | `string` | `undefined` |
| `where` | `Record`<`string`, `any`\> | `undefined` |
| `cause` | `unknown` | `null` |

#### Overrides

[EntAccessError](EntAccessError.md).[constructor](EntAccessError.md#constructor)

#### Defined in

[src/ent/errors/EntNotFoundError.ts:8](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntNotFoundError.ts#L8)

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

### where

• `Readonly` **where**: `Record`<`string`, `any`\>

#### Defined in

[src/ent/errors/EntNotFoundError.ts:10](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntNotFoundError.ts#L10)
