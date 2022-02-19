[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Validation

# Class: Validation<TTable\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Constructors

### constructor

• **new Validation**<`TTable`\>(`entName`, `rules`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entName` | `string` |
| `rules` | [`ValidationRules`](../modules.md#validationrules)<`TTable`\> |

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:39](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L39)

## Properties

### delete

• `Readonly` **delete**: [`Rule`](Rule.md)<[`Row`](../modules.md#row)<`TTable`\>\>[]

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:36](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L36)

___

### insert

• `Readonly` **insert**: [`Rule`](Rule.md)<[`InsertInput`](../modules.md#insertinput)<`TTable`\>\>[]

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:34](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L34)

___

### load

• `Readonly` **load**: [`Rule`](Rule.md)<[`Row`](../modules.md#row)<`TTable`\>\>[]

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:33](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L33)

___

### tenantUserIDField

• `Optional` `Readonly` **tenantUserIDField**: [`InsertFieldsRequired`](../modules.md#insertfieldsrequired)<`TTable`\>

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:32](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L32)

___

### update

• `Readonly` **update**: [`Rule`](Rule.md)<[`Row`](../modules.md#row)<`TTable`\>\>[]

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:35](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L35)

___

### validate

• `Readonly` **validate**: [`Require`](Require.md)<[`Row`](../modules.md#row)<`TTable`\>\>[]

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:37](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L37)

## Methods

### validateDelete

▸ **validateDelete**(`vc`, `row`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`Row`](../modules.md#row)<`TTable`\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:94](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L94)

___

### validateInsert

▸ **validateInsert**(`vc`, `input`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:59](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L59)

___

### validateLoad

▸ **validateLoad**(`vc`, `row`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`Row`](../modules.md#row)<`TTable`\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:48](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L48)

___

### validateUpdate

▸ **validateUpdate**(`vc`, `old`, `input`, `privacyOnly?`): `Promise`<`void`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `vc` | [`VC`](VC.md) | `undefined` |
| `old` | [`Row`](../modules.md#row)<`TTable`\> | `undefined` |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> | `undefined` |
| `privacyOnly` | `boolean` | `false` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:71](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L71)
