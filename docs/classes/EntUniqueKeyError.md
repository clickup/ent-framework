[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / EntUniqueKeyError

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

[packages/ent-framework/src/ent/errors/EntUniqueKeyError.ts:8](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/errors/EntUniqueKeyError.ts#L8)

## Properties

### entName

• `Readonly` **entName**: `string`

___

### input

• `Readonly` **input**: `any`

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

___

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

[packages/ent-framework/src/ent/errors/EntUniqueKeyError.ts:21](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/errors/EntUniqueKeyError.ts#L21)
