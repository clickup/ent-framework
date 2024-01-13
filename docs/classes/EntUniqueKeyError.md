[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / EntUniqueKeyError

# Class: EntUniqueKeyError

Error: while inserting or updating, DB unique key was violated,
so the Ent was not mutated.

## Hierarchy

- `Error`

  ↳ **`EntUniqueKeyError`**

## Constructors

### constructor

• **new EntUniqueKeyError**(`entName`, `input`): [`EntUniqueKeyError`](EntUniqueKeyError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `entName` | `string` |
| `input` | `unknown` |

#### Returns

[`EntUniqueKeyError`](EntUniqueKeyError.md)

#### Overrides

Error.constructor

#### Defined in

[src/ent/errors/EntUniqueKeyError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntUniqueKeyError.ts#L8)

## Properties

### entName

• `Readonly` **entName**: `string`

#### Defined in

[src/ent/errors/EntUniqueKeyError.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntUniqueKeyError.ts#L9)

___

### input

• `Readonly` **input**: `unknown`

#### Defined in

[src/ent/errors/EntUniqueKeyError.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntUniqueKeyError.ts#L10)

## Methods

### ignore

▸ **ignore**\<`T`\>(`promise`): `Promise`\<`undefined` \| `T`\>

Returns a promise of T on success, and undefined in case unique key
violation happened during the promise resolution.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `promise` | `Promise`\<`T`\> |

#### Returns

`Promise`\<`undefined` \| `T`\>

#### Defined in

[src/ent/errors/EntUniqueKeyError.ts:28](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntUniqueKeyError.ts#L28)
