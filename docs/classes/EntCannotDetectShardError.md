[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / EntCannotDetectShardError

# Class: EntCannotDetectShardError

Error: when the system cannot detect the target shard to work with (e.g. an
Ent doesn't refer to any other Ent with Shard affinity).

Throwing of this error signals about a bug in the code, so it is not
user-facing (thus, not derived from EntAccessError).

## Hierarchy

- `Error`

  ↳ **`EntCannotDetectShardError`**

## Constructors

### constructor

• **new EntCannotDetectShardError**(`entName`, `op`, `fields`, `input`, `shardAffinity`, `inverseFields?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `entName` | `string` |
| `op` | `string` |
| `fields` | readonly `string`[] |
| `input` | `any` |
| `shardAffinity` | `any` |
| `inverseFields?` | `string`[] |

#### Overrides

Error.constructor

#### Defined in

[src/ent/errors/EntCannotDetectShardError.ts:11](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntCannotDetectShardError.ts#L11)

## Properties

### entName

• `Readonly` **entName**: `string`

#### Defined in

[src/ent/errors/EntCannotDetectShardError.ts:12](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntCannotDetectShardError.ts#L12)

___

### op

• `Readonly` **op**: `string`

#### Defined in

[src/ent/errors/EntCannotDetectShardError.ts:13](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntCannotDetectShardError.ts#L13)

___

### fields

• `Readonly` **fields**: readonly `string`[]

#### Defined in

[src/ent/errors/EntCannotDetectShardError.ts:14](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntCannotDetectShardError.ts#L14)

___

### input

• `Readonly` **input**: `any`

#### Defined in

[src/ent/errors/EntCannotDetectShardError.ts:15](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntCannotDetectShardError.ts#L15)

___

### shardAffinity

• `Readonly` **shardAffinity**: `any`

#### Defined in

[src/ent/errors/EntCannotDetectShardError.ts:16](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntCannotDetectShardError.ts#L16)

___

### inverseFields

• `Optional` `Readonly` **inverseFields**: `string`[]

#### Defined in

[src/ent/errors/EntCannotDetectShardError.ts:17](https://github.com/clickup/rest-client/blob/master/src/ent/errors/EntCannotDetectShardError.ts#L17)
