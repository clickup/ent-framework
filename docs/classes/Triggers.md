[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Triggers

# Class: Triggers<TTable\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Constructors

### constructor

• **new Triggers**<`TTable`\>(`beforeInsert`, `beforeUpdate`, `beforeDelete`, `afterInsert`, `afterUpdate`, `afterDelete`, `afterMutation`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `beforeInsert` | [`InsertTrigger`](../modules.md#inserttrigger)<`TTable`\>[] |
| `beforeUpdate` | [`BeforeUpdateTrigger`](../modules.md#beforeupdatetrigger)<`TTable`\>[] |
| `beforeDelete` | [`DeleteTrigger`](../modules.md#deletetrigger)<`TTable`\>[] |
| `afterInsert` | [`InsertTrigger`](../modules.md#inserttrigger)<`TTable`\>[] |
| `afterUpdate` | [``null`` \| [`DepsBuilder`](../modules.md#depsbuilder)<`TTable`\>, [`AfterUpdateTrigger`](../modules.md#afterupdatetrigger)<`TTable`\>][] |
| `afterDelete` | [`DeleteTrigger`](../modules.md#deletetrigger)<`TTable`\>[] |
| `afterMutation` | [``null`` \| [`DepsBuilder`](../modules.md#depsbuilder)<`TTable`\>, [`AfterMutationTrigger`](../modules.md#aftermutationtrigger)<`TTable`\>][] |

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:102](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L102)

## Methods

### hasInsertTriggers

▸ **hasInsertTriggers**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:116](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L116)

___

### hasUpdateTriggers

▸ **hasUpdateTriggers**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:124](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L124)

___

### wrapDelete

▸ **wrapDelete**(`func`, `vc`, `oldRow`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `func` | () => `Promise`<`boolean`\> |
| `vc` | [`VC`](VC.md) |
| `oldRow` | [`Row`](../modules.md#row)<`TTable`\> |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:226](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L226)

___

### wrapInsert

▸ **wrapInsert**(`func`, `vc`, `input`): `Promise`<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `func` | (`input`: { [K in string \| number \| symbol]: Value<TTable[K]\> } & { [K in string \| number \| symbol]?: Value<TTable[K]\> } & [`RowWithID`](../modules.md#rowwithid)) => `Promise`<``null`` \| `string`\> |
| `vc` | [`VC`](VC.md) |
| `input` | { [K in string \| number \| symbol]: Value<TTable[K]\> } & { [K in string \| number \| symbol]?: Value<TTable[K]\> } & [`RowWithID`](../modules.md#rowwithid) |

#### Returns

`Promise`<``null`` \| `string`\>

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:132](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L132)

___

### wrapUpdate

▸ **wrapUpdate**(`func`, `vc`, `oldRow`, `input`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `func` | (`input`: [`UpdateInput`](../modules.md#updateinput)<`TTable`\>) => `Promise`<`boolean`\> |
| `vc` | [`VC`](VC.md) |
| `oldRow` | [`Row`](../modules.md#row)<`TTable`\> |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:163](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L163)
