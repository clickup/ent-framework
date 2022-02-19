[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / EntAccessError

# Class: EntAccessError

A base class for errors which trigger the validation framework to process
them as a DENY/SKIP.

## Hierarchy

- `Error`

  ↳ **`EntAccessError`**

  ↳↳ [`EntNotFoundError`](EntNotFoundError.md)

  ↳↳ [`EntNotInsertableError`](EntNotInsertableError.md)

  ↳↳ [`EntNotReadableError`](EntNotReadableError.md)

  ↳↳ [`EntNotUpdatableError`](EntNotUpdatableError.md)

  ↳↳ [`EntValidationError`](EntValidationError.md)

## Constructors

### constructor

• **new EntAccessError**(`message`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |

#### Overrides

Error.constructor

#### Defined in

[packages/ent-framework/src/ent/errors/EntAccessError.ts:8](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/errors/EntAccessError.ts#L8)

## Properties

### entName

• `Readonly` `Abstract` **entName**: `string`

#### Defined in

[packages/ent-framework/src/ent/errors/EntAccessError.ts:6](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/errors/EntAccessError.ts#L6)

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
