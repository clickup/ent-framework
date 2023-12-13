[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / EntUniqueKeyError

# Class: EntUniqueKeyError

Error: while inserting or updating, DB unique key was violated,
so the Ent was not mutated.

## Hierarchy

- `Error`

  ↳ **`EntUniqueKeyError`**

## Constructors

### constructor

• **new EntUniqueKeyError**(`entName`, `input`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `entName` | `string` |
| `input` | `any` |

#### Overrides

Error.constructor

#### Defined in

[src/ent/errors/EntUniqueKeyError.ts:8](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntUniqueKeyError.ts#L8)

## Properties

### entName

• `Readonly` **entName**: `string`

#### Defined in

[src/ent/errors/EntUniqueKeyError.ts:8](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntUniqueKeyError.ts#L8)

___

### input

• `Readonly` **input**: `any`

#### Defined in

[src/ent/errors/EntUniqueKeyError.ts:8](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntUniqueKeyError.ts#L8)

## Methods

### ignore

▸ `Static` **ignore**<`T`\>(`promise`): `Promise`<`undefined` \| `T`\>

Returns a promise of T on success, and undefined in case unique key
violation happened during the promise resolution.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `promise` | `Promise`<`T`\> |

#### Returns

`Promise`<`undefined` \| `T`\>

#### Defined in

[src/ent/errors/EntUniqueKeyError.ts:20](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntUniqueKeyError.ts#L20)
