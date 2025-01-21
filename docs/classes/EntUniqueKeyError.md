[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntUniqueKeyError

# Class: EntUniqueKeyError

Defined in: [src/ent/errors/EntUniqueKeyError.ts:7](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntUniqueKeyError.ts#L7)

Error: while inserting or updating, DB unique key was violated,
so the Ent was not mutated.

## Extends

- `Error`

## Constructors

### new EntUniqueKeyError()

> **new EntUniqueKeyError**(`entName`, `input`): [`EntUniqueKeyError`](EntUniqueKeyError.md)

Defined in: [src/ent/errors/EntUniqueKeyError.ts:8](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntUniqueKeyError.ts#L8)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `entName` | `string` |
| `input` | `unknown` |

#### Returns

[`EntUniqueKeyError`](EntUniqueKeyError.md)

#### Overrides

`Error.constructor`

## Properties

| Property | Type |
| ------ | ------ |
| <a id="entname-1"></a> `entName` | `string` |
| <a id="input-1"></a> `input` | `unknown` |

## Methods

### ignore()

> `static` **ignore**\<`T`\>(`promise`): `Promise`\<`undefined` \| `T`\>

Defined in: [src/ent/errors/EntUniqueKeyError.ts:28](https://github.com/clickup/ent-framework/blob/master/src/ent/errors/EntUniqueKeyError.ts#L28)

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
