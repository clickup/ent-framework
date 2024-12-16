[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Validation

# Class: Validation\<TTable\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Constructors

### new Validation()

> **new Validation**\<`TTable`\>(`entName`, `rules`): [`Validation`](Validation.md)\<`TTable`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `entName` | `string` |
| `rules` | [`ValidationRules`](../type-aliases/ValidationRules.md)\<`TTable`\> |

#### Returns

[`Validation`](Validation.md)\<`TTable`\>

#### Defined in

[src/ent/Validation.ts:80](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L80)

## Properties

| Property | Type |
| ------ | ------ |
| `tenantPrincipalField?` | [`InsertFieldsRequired`](../type-aliases/InsertFieldsRequired.md)\<`TTable`\> & `string` |
| `inferPrincipal` | (`vc`: [`VC`](VC.md), `row`: [`Row`](../type-aliases/Row.md)\<`TTable`\>) => `Promise`\<[`VC`](VC.md)\> |
| `load` | [`LoadRule`](../type-aliases/LoadRule.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>\>[] |
| `insert` | [`WriteRules`](../type-aliases/WriteRules.md)\<[`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>\> |
| `update` | [`WriteRules`](../type-aliases/WriteRules.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>\> |
| `delete` | [`WriteRules`](../type-aliases/WriteRules.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>\> |
| `validate` | [`Require`](Require.md)\<[`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>\>[] |

## Methods

### validateLoad()

> **validateLoad**(`vc`, `row`): `Promise`\<`void`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`Row`](../type-aliases/Row.md)\<`TTable`\> |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/ent/Validation.ts:93](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L93)

***

### validateInsert()

> **validateInsert**(`vc`, `input`): `Promise`\<`void`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `input` | [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/ent/Validation.ts:104](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L104)

***

### validateUpdate()

> **validateUpdate**(`vc`, `old`, `input`, `privacyOnly`): `Promise`\<`void`\>

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `vc` | [`VC`](VC.md) | `undefined` |
| `old` | [`Row`](../type-aliases/Row.md)\<`TTable`\> | `undefined` |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> | `undefined` |
| `privacyOnly` | `boolean` | `false` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/ent/Validation.ts:116](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L116)

***

### validateDelete()

> **validateDelete**(`vc`, `row`): `Promise`\<`void`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`Row`](../type-aliases/Row.md)\<`TTable`\> |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/ent/Validation.ts:143](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L143)
