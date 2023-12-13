[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / FieldIs

# Class: FieldIs

Checks that the validator function returns true for the value in some field.

## Implements

- [`Predicate`](../interfaces/Predicate.md)<`Record`<`string`, `any`\>\>
- [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)

## Constructors

### constructor

• **new FieldIs**(`field`, `validator`, `message`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |
| `validator` | (`fieldValue`: `any`, `row`: `Record`<`string`, `any`\>, `vc`: [`VC`](VC.md)) => `boolean` \| `Promise`<`boolean`\> |
| `message` | `string` |

#### Defined in

[src/ent/predicates/FieldIs.ts:13](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/FieldIs.ts#L13)

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[src/ent/predicates/FieldIs.ts:11](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/FieldIs.ts#L11)

___

### field

• `Readonly` **field**: `string`

#### Implementation of

[EntValidationErrorInfo](../interfaces/EntValidationErrorInfo.md).[field](../interfaces/EntValidationErrorInfo.md#field)

#### Defined in

[src/ent/predicates/FieldIs.ts:14](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/FieldIs.ts#L14)

___

### validator

• `Readonly` **validator**: (`fieldValue`: `any`, `row`: `Record`<`string`, `any`\>, `vc`: [`VC`](VC.md)) => `boolean` \| `Promise`<`boolean`\>

#### Type declaration

▸ (`fieldValue`, `row`, `vc`): `boolean` \| `Promise`<`boolean`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `fieldValue` | `any` |
| `row` | `Record`<`string`, `any`\> |
| `vc` | [`VC`](VC.md) |

##### Returns

`boolean` \| `Promise`<`boolean`\>

#### Defined in

[src/ent/predicates/FieldIs.ts:15](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/FieldIs.ts#L15)

___

### message

• `Readonly` **message**: `string`

#### Implementation of

[EntValidationErrorInfo](../interfaces/EntValidationErrorInfo.md).[message](../interfaces/EntValidationErrorInfo.md#message)

#### Defined in

[src/ent/predicates/FieldIs.ts:20](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/FieldIs.ts#L20)

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

[src/ent/predicates/FieldIs.ts:23](https://github.com/clickup/rest-client/blob/master/src/ent/predicates/FieldIs.ts#L23)
