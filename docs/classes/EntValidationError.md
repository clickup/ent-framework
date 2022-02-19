[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / EntValidationError

# Class: EntValidationError

Error: thrown after all validators are executed, and some of them think that
the row is invalid.

## Hierarchy

- [`EntAccessError`](EntAccessError.md)

  ↳ **`EntValidationError`**

## Constructors

### constructor

• **new EntValidationError**(`entName`, `errors`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `entName` | `string` |
| `errors` | readonly [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[] |

#### Overrides

[EntAccessError](EntAccessError.md).[constructor](EntAccessError.md#constructor)

#### Defined in

[packages/ent-framework/src/ent/errors/EntValidationError.ts:8](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/errors/EntValidationError.ts#L8)

## Properties

### entName

• `Readonly` **entName**: `string`

#### Inherited from

[EntAccessError](EntAccessError.md).[entName](EntAccessError.md#entname)

___

### errors

• `Readonly` **errors**: readonly [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)[]

___

### message

• **message**: `string`

#### Inherited from

[EntAccessError](EntAccessError.md).[message](EntAccessError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1023

___

### name

• **name**: `string`

#### Inherited from

[EntAccessError](EntAccessError.md).[name](EntAccessError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1022

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[EntAccessError](EntAccessError.md).[stack](EntAccessError.md#stack)

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

[EntAccessError](EntAccessError.md).[prepareStackTrace](EntAccessError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[EntAccessError](EntAccessError.md).[stackTraceLimit](EntAccessError.md#stacktracelimit)

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

[EntAccessError](EntAccessError.md).[captureStackTrace](EntAccessError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:4
