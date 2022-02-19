[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / ValidationTester

# Class: ValidationTester

A helper class to log some predicate response (plus the row argument) and
return it, see how it's used in the code.

- Q: "If we have a class which validates a validation, who'd be validating
  the function which validates the validation?"
- A: "TS & Jest"

## Constructors

### constructor

• **new ValidationTester**()

## Methods

### matchSnapshot

▸ **matchSnapshot**<`TTable`\>(`validation`, `row`, `method?`, `vc?`): `Promise`<`void`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `validation` | [`Validation`](Validation.md)<`TTable`\> | `undefined` |
| `row` | [`Row`](../modules.md#row)<`TTable`\> | `undefined` |
| `method?` | ``"validateLoad"`` \| ``"validateInsert"`` \| ``"validateUpdate"`` \| ``"validateDelete"`` | `undefined` |
| `vc` | [`VC`](VC.md) | `vcTestGuest` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ent-framework/src/ent/__tests__/helpers/ValidationTester.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/__tests__/helpers/ValidationTester.ts#L31)

___

### respond

▸ **respond**(`response`, `row?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `response` | `boolean` \| `Error` |
| `row?` | `any` |

#### Returns

`boolean`

#### Defined in

[packages/ent-framework/src/ent/__tests__/helpers/ValidationTester.ts:17](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/__tests__/helpers/ValidationTester.ts#L17)
