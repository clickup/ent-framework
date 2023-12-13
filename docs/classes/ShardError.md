[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / ShardError

# Class: ShardError

Thrown by the engine when an error is related to sharding.

## Hierarchy

- [`ServerError`](ServerError.md)

  ↳ **`ShardError`**

## Constructors

### constructor

• **new ShardError**(`origError`, `destName`, `postAction`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `origError` | `any` |
| `destName` | `string` |
| `postAction` | ``"rediscover"`` \| ``"fail"`` |

#### Overrides

[ServerError](ServerError.md).[constructor](ServerError.md#constructor)

#### Defined in

[src/abstract/ShardError.ts:7](https://github.com/clickup/rest-client/blob/master/src/abstract/ShardError.ts#L7)

## Properties

### origError

• `Readonly` **origError**: `any`

#### Inherited from

[ServerError](ServerError.md).[origError](ServerError.md#origerror)

#### Defined in

[src/abstract/ServerError.ts:10](https://github.com/clickup/rest-client/blob/master/src/abstract/ServerError.ts#L10)

___

### postAction

• `Readonly` **postAction**: ``"rediscover"`` \| ``"fail"``

#### Defined in

[src/abstract/ShardError.ts:10](https://github.com/clickup/rest-client/blob/master/src/abstract/ShardError.ts#L10)
