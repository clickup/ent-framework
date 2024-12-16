[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntUniqueKeyError

# Class: EntUniqueKeyError

Error: while inserting or updating, DB unique key was violated,
so the Ent was not mutated.

## Extends

- `Error`

## Constructors

### new EntUniqueKeyError()

> **new EntUniqueKeyError**(`entName`, `input`): [`EntUniqueKeyError`](EntUniqueKeyError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `entName` | `string` |
| `input` | `unknown` |

#### Returns

[`EntUniqueKeyError`](EntUniqueKeyError.md)

#### Overrides

`Error.constructor`

#### Defined in

[src/ent/errors/EntUniqueKeyError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntUniqueKeyError.ts#L8)

## Properties

| Property | Type |
| ------ | ------ |
| `entName` | `string` |
| `input` | `unknown` |

## Methods

### ignore()

> `static` **ignore**\<`T`\>(`promise`): `Promise`\<`undefined` \| `T`\>

Returns a promise of T on success, and undefined in case unique key
violation happened during the promise resolution.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `promise` | `Promise`\<`T`\> |

#### Returns

`Promise`\<`undefined` \| `T`\>

#### Defined in

[src/ent/errors/EntUniqueKeyError.ts:28](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntUniqueKeyError.ts#L28)
