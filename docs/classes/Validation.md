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

[src/ent/Validation.ts:81](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L81)

## Properties

### tenantPrincipalField

• `Optional` `Readonly` **tenantPrincipalField**: [`InsertFieldsRequired`](../modules.md#insertfieldsrequired)<`TTable`\> & `string`

#### Defined in

[src/ent/Validation.ts:73](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L73)

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

[src/ent/Validation.ts:74](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L74)

___

### load

• `Readonly` **load**: [`LoadRule`](../modules.md#loadrule)<[`Row`](../modules.md#row)<`TTable`\>\>[]

#### Defined in

[src/ent/Validation.ts:75](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L75)

___

### insert

• `Readonly` **insert**: [`WriteRules`](../modules.md#writerules)<[`InsertInput`](../modules.md#insertinput)<`TTable`\>\>

#### Defined in

[src/ent/Validation.ts:76](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L76)

___

### update

• `Readonly` **update**: [`WriteRules`](../modules.md#writerules)<[`Row`](../modules.md#row)<`TTable`\>\>

#### Defined in

[src/ent/Validation.ts:77](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L77)

___

### delete

• `Readonly` **delete**: [`WriteRules`](../modules.md#writerules)<[`Row`](../modules.md#row)<`TTable`\>\>

#### Defined in

[src/ent/Validation.ts:78](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L78)

___

### validate

• `Readonly` **validate**: [`Require`](Require.md)<[`Row`](../modules.md#row)<`TTable`\>\>[]

#### Defined in

[src/ent/Validation.ts:79](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L79)

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

[src/ent/Validation.ts:91](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L91)

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

[src/ent/Validation.ts:102](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L102)

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

[src/ent/Validation.ts:114](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L114)

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

[src/ent/Validation.ts:137](https://github.com/clickup/rest-client/blob/master/src/ent/Validation.ts#L137)
