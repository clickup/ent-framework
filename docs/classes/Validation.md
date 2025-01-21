[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Validation

# Class: Validation\<TTable\>

Defined in: [src/ent/Validation.ts:71](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L71)

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Constructors

### new Validation()

> **new Validation**\<`TTable`\>(`entName`, `rules`): [`Validation`](Validation.md)\<`TTable`\>

Defined in: [src/ent/Validation.ts:80](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L80)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `entName` | `string` |
| `rules` | [`ValidationRules`](../type-aliases/ValidationRules.md)\<`TTable`\> |

#### Returns

[`Validation`](Validation.md)\<`TTable`\>

## Properties

| Property | Type |
| ------ | ------ |
| <a id="tenantprincipalfield"></a> `tenantPrincipalField?` | [`InsertFieldsRequired`](../type-aliases/InsertFieldsRequired.md)\<`TTable`\> & `string` |
| <a id="inferprincipal"></a> `inferPrincipal` | (`vc`: [`VC`](VC.md), `row`: [`Row`](../type-aliases/Row.md)\<`TTable`\>) => `Promise`\<[`VC`](VC.md)\> |
| <a id="load"></a> `load` | [`LoadRule`](../type-aliases/LoadRule.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>\>[] |
| <a id="insert"></a> `insert` | [`WriteRules`](../type-aliases/WriteRules.md)\<[`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>\> |
| <a id="update"></a> `update` | [`WriteRules`](../type-aliases/WriteRules.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>\> |
| <a id="delete"></a> `delete` | [`WriteRules`](../type-aliases/WriteRules.md)\<[`Row`](../type-aliases/Row.md)\<`TTable`\>\> |
| <a id="validate"></a> `validate` | [`Require`](Require.md)\<[`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\>\>[] |

## Methods

### validateLoad()

> **validateLoad**(`vc`, `row`): `Promise`\<`void`\>

Defined in: [src/ent/Validation.ts:93](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L93)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`Row`](../type-aliases/Row.md)\<`TTable`\> |

#### Returns

`Promise`\<`void`\>

***

### validateInsert()

> **validateInsert**(`vc`, `input`): `Promise`\<`void`\>

Defined in: [src/ent/Validation.ts:104](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L104)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `input` | [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`void`\>

***

### validateUpdate()

> **validateUpdate**(`vc`, `old`, `input`, `privacyOnly`): `Promise`\<`void`\>

Defined in: [src/ent/Validation.ts:116](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L116)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `vc` | [`VC`](VC.md) | `undefined` |
| `old` | [`Row`](../type-aliases/Row.md)\<`TTable`\> | `undefined` |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> | `undefined` |
| `privacyOnly` | `boolean` | `false` |

#### Returns

`Promise`\<`void`\>

***

### validateDelete()

> **validateDelete**(`vc`, `row`): `Promise`\<`void`\>

Defined in: [src/ent/Validation.ts:143](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L143)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`Row`](../type-aliases/Row.md)\<`TTable`\> |

#### Returns

`Promise`\<`void`\>
