[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / FieldIs

# Class: FieldIs\<TField, TRow\>

Checks that the validator function returns true for the value in some field.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |
| `TRow` | extends `Partial`\<`Record`\<`TField`, `unknown`\>\> |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`TRow`\>
- [`EntValidationErrorInfo`](../interfaces/EntValidationErrorInfo.md)

## Constructors

### constructor

• **new FieldIs**\<`TField`, `TRow`\>(`field`, `validator`, `message`): [`FieldIs`](FieldIs.md)\<`TField`, `TRow`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |
| `TRow` | extends `Partial`\<`Record`\<`TField`, `unknown`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `TField` |
| `validator` | (`fieldValue`: `TRow`[`TField`], `row`: `TRow`, `vc`: [`VC`](VC.md)) => `boolean` \| `Promise`\<`boolean`\> |
| `message` | `string` |

#### Returns

[`FieldIs`](FieldIs.md)\<`TField`, `TRow`\>

#### Defined in

[src/ent/predicates/FieldIs.ts:16](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L16)

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[src/ent/predicates/FieldIs.ts:14](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L14)

___

### field

• `Readonly` **field**: `TField`

#### Implementation of

[EntValidationErrorInfo](../interfaces/EntValidationErrorInfo.md).[field](../interfaces/EntValidationErrorInfo.md#field)

#### Defined in

[src/ent/predicates/FieldIs.ts:17](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L17)

___

### validator

• `Readonly` **validator**: (`fieldValue`: `TRow`[`TField`], `row`: `TRow`, `vc`: [`VC`](VC.md)) => `boolean` \| `Promise`\<`boolean`\>

#### Type declaration

▸ (`fieldValue`, `row`, `vc`): `boolean` \| `Promise`\<`boolean`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `fieldValue` | `TRow`[`TField`] |
| `row` | `TRow` |
| `vc` | [`VC`](VC.md) |

##### Returns

`boolean` \| `Promise`\<`boolean`\>

#### Defined in

[src/ent/predicates/FieldIs.ts:18](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L18)

___

### message

• `Readonly` **message**: `string`

#### Implementation of

[EntValidationErrorInfo](../interfaces/EntValidationErrorInfo.md).[message](../interfaces/EntValidationErrorInfo.md#message)

#### Defined in

[src/ent/predicates/FieldIs.ts:23](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L23)

## Methods

### check

▸ **check**(`vc`, `row`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | `TRow` |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/FieldIs.ts:28](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/FieldIs.ts#L28)
