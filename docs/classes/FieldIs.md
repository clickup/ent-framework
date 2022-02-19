[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / FieldIs

# Class: FieldIs

Checks that the validator function returns true for the value in some field.

## Implements

- [`Predicate`](../interfaces/Predicate.md)<`Record`<`string`, `any`\>\>
- [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)

## Constructors

### constructor

• **new FieldIs**(`field`, `validator`, `message`, `condition?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |
| `validator` | (`fieldValue`: `any`, `row`: `Record`<`string`, `any`\>) => `boolean` |
| `message` | `string` |
| `condition?` | (`vc`: [`VC`](VC.md)) => `boolean` |

#### Defined in

[packages/ent-framework/src/ent/predicates/FieldIs.ts:13](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/FieldIs.ts#L13)

## Properties

### field

• `Readonly` **field**: `string`

#### Implementation of

[EntValidationErrorInfo](../interfaces/EntValidationErrorInfo.md).[field](../interfaces/EntValidationErrorInfo.md#field)

___

### message

• `Readonly` **message**: `string`

#### Implementation of

[EntValidationErrorInfo](../interfaces/EntValidationErrorInfo.md).[message](../interfaces/EntValidationErrorInfo.md#message)

___

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[packages/ent-framework/src/ent/predicates/FieldIs.ts:11](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/FieldIs.ts#L11)

___

### validator

• `Readonly` **validator**: (`fieldValue`: `any`, `row`: `Record`<`string`, `any`\>) => `boolean`

#### Type declaration

▸ (`fieldValue`, `row`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fieldValue` | `any` |
| `row` | `Record`<`string`, `any`\> |

##### Returns

`boolean`

## Methods

### check

▸ **check**(`vc`, `row`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | `Record`<`string`, `any`\> |

#### Returns

`Promise`<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[packages/ent-framework/src/ent/predicates/FieldIs.ts:24](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/FieldIs.ts#L24)
