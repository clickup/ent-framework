[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / EntNotInsertableError

# Class: EntNotInsertableError

Error: thrown when an Ent cannot be inserted due to privacy reasons.

## Hierarchy

- [`EntAccessError`](EntAccessError.md)

  ↳ **`EntNotInsertableError`**

## Constructors

### constructor

• **new EntNotInsertableError**(`entName`, `vc`, `row`, `cause?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `entName` | `string` | `undefined` |
| `vc` | `string` | `undefined` |
| `row` | `object` | `undefined` |
| `cause` | ``null`` \| `string` \| { `message`: `string`  } | `null` |

#### Overrides

[EntAccessError](EntAccessError.md).[constructor](EntAccessError.md#constructor)

#### Defined in

[packages/ent-framework/src/ent/errors/EntNotInsertableError.ts:8](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/errors/EntNotInsertableError.ts#L8)

## Properties

### cause

• `Readonly` **cause**: ``null`` \| `string` \| { `message`: `string`  } = `null`

___

### entName

• `Readonly` **entName**: `string`

#### Inherited from

[EntAccessError](EntAccessError.md).[entName](EntAccessError.md#entname)

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

### row

• `Readonly` **row**: `object`

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[EntAccessError](EntAccessError.md).[stack](EntAccessError.md#stack)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1024

___

### vc

• `Readonly` **vc**: `string`

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