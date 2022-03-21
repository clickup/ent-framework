[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SQLError

# Class: SQLError

## Hierarchy

- `Error`

  ↳ **`SQLError`**

## Constructors

### constructor

• **new SQLError**(`origError`, `destName`, `sql`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `origError` | `any` |
| `destName` | `string` |
| `sql` | `string` |

#### Overrides

Error.constructor

#### Defined in

[packages/ent-framework/src/sql/SQLError.ts:4](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLError.ts#L4)

## Properties

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

### origError

• `Readonly` **origError**: `any`

___

### sql

• `Readonly` **sql**: `string`

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

### isFKError

▸ **isFKError**(`fkName?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fkName?` | `string` |

#### Returns

`boolean`

#### Defined in

[packages/ent-framework/src/sql/SQLError.ts:27](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLError.ts#L27)

___

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