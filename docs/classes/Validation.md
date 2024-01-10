[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Validation

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

[src/ent/Validation.ts:84](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L84)

## Properties

### tenantPrincipalField

• `Optional` `Readonly` **tenantPrincipalField**: [`InsertFieldsRequired`](../modules.md#insertfieldsrequired)<`TTable`\> & `string`

#### Defined in

[src/ent/Validation.ts:76](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L76)

___

### inferPrincipal

• `Optional` `Readonly` **inferPrincipal**: (`vc`: [`VC`](VC.md), `row`: [`Row`](../modules.md#row)<`TTable`\>) => `Promise`<``null`` \| `string`\>

#### Type declaration

▸ (`vc`, `row`): `Promise`<``null`` \| `string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`Row`](../modules.md#row)<`TTable`\> |

##### Returns

`Promise`<``null`` \| `string`\>

#### Defined in

[src/ent/Validation.ts:77](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L77)

___

### load

• `Readonly` **load**: [`LoadRule`](../modules.md#loadrule)<[`Row`](../modules.md#row)<`TTable`\>\>[]

#### Defined in

[src/ent/Validation.ts:78](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L78)

___

### insert

• `Readonly` **insert**: [`WriteRules`](../modules.md#writerules)<[`InsertInput`](../modules.md#insertinput)<`TTable`\>\>

#### Defined in

[src/ent/Validation.ts:79](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L79)

___

### update

• `Readonly` **update**: [`WriteRules`](../modules.md#writerules)<[`Row`](../modules.md#row)<`TTable`\>\>

#### Defined in

[src/ent/Validation.ts:80](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L80)

___

### delete

• `Readonly` **delete**: [`WriteRules`](../modules.md#writerules)<[`Row`](../modules.md#row)<`TTable`\>\>

#### Defined in

[src/ent/Validation.ts:81](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L81)

___

### validate

• `Readonly` **validate**: [`Require`](Require.md)<[`InsertInput`](../modules.md#insertinput)<`TTable`\>\>[]

#### Defined in

[src/ent/Validation.ts:82](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L82)

## Methods

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

[src/ent/Validation.ts:94](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L94)

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

[src/ent/Validation.ts:105](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L105)

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

[src/ent/Validation.ts:117](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L117)

___

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

[src/ent/Validation.ts:144](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L144)
