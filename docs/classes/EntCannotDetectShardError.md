[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / EntCannotDetectShardError

# Class: EntCannotDetectShardError

Error: when the system cannot detect the target shard to work with
(e.g. an Ent doesn't refer to any other Ent with shard affinity).

## Hierarchy

- `Error`

  ↳ **`EntCannotDetectShardError`**

## Constructors

### constructor

• **new EntCannotDetectShardError**(`schemaName`, `op`, `fields`, `input`, `shardAffinity`, `inverseFields?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaName` | `string` |
| `op` | `string` |
| `fields` | readonly `string`[] |
| `input` | `any` |
| `shardAffinity` | `any` |
| `inverseFields?` | `string`[] |

#### Overrides

Error.constructor

#### Defined in

[packages/ent-framework/src/ent/errors/EntCannotDetectShardError.ts:8](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/errors/EntCannotDetectShardError.ts#L8)

## Properties

### fields

• `Readonly` **fields**: readonly `string`[]

___

### input

• `Readonly` **input**: `any`

___

### inverseFields

• `Optional` `Readonly` **inverseFields**: `string`[]

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1023

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1022

___

### op

• `Readonly` **op**: `string`

___

### schemaName

• `Readonly` **schemaName**: `string`

___

### shardAffinity

• `Readonly` **shardAffinity**: `any`

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1024

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

#### Type declaration

▸ (`err`, `stackTraces`): `any`

Optional override for formatting stack traces

**`see`** https://v8.dev/docs/stack-trace-api#customizing-stack-traces

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

#### Defined in

node_modules/@types/node/globals.d.ts:13

## Methods

### captureStackTrace

▸ `Static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:4
