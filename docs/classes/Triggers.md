[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Triggers

# Class: Triggers\<TTable\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Constructors

### constructor

• **new Triggers**\<`TTable`\>(`beforeInsert`, `beforeUpdate`, `beforeDelete`, `beforeMutation`, `afterInsert`, `afterUpdate`, `afterDelete`, `afterMutation`): [`Triggers`](Triggers.md)\<`TTable`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `beforeInsert` | [`InsertTrigger`](../modules.md#inserttrigger)\<`TTable`\>[] |
| `beforeUpdate` | [``null`` \| [`DepsBuilder`](../modules.md#depsbuilder)\<`TTable`\>, [`BeforeUpdateTrigger`](../modules.md#beforeupdatetrigger)\<`TTable`\>][] |
| `beforeDelete` | [`DeleteTrigger`](../modules.md#deletetrigger)\<`TTable`\>[] |
| `beforeMutation` | [``null`` \| [`DepsBuilder`](../modules.md#depsbuilder)\<`TTable`\>, [`BeforeMutationTrigger`](../modules.md#beforemutationtrigger)\<`TTable`\>][] |
| `afterInsert` | [`InsertTrigger`](../modules.md#inserttrigger)\<`TTable`\>[] |
| `afterUpdate` | [``null`` \| [`DepsBuilder`](../modules.md#depsbuilder)\<`TTable`\>, [`AfterUpdateTrigger`](../modules.md#afterupdatetrigger)\<`TTable`\>][] |
| `afterDelete` | [`DeleteTrigger`](../modules.md#deletetrigger)\<`TTable`\>[] |
| `afterMutation` | [``null`` \| [`DepsBuilder`](../modules.md#depsbuilder)\<`TTable`\>, [`AfterMutationTrigger`](../modules.md#aftermutationtrigger)\<`TTable`\>][] |

#### Returns

[`Triggers`](Triggers.md)\<`TTable`\>

#### Defined in

[src/ent/Triggers.ts:170](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L170)

## Methods

### hasInsertTriggers

▸ **hasInsertTriggers**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/ent/Triggers.ts:189](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L189)

___

### hasUpdateTriggers

▸ **hasUpdateTriggers**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/ent/Triggers.ts:198](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L198)

___

### wrapInsert

▸ **wrapInsert**(`func`, `vc`, `input`): `Promise`\<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `func` | (`input`: \{ [K in string \| number \| symbol]: Value\<TTable[K]\> } & \{ [K in string \| number \| symbol]?: Value\<TTable[K]\> } & [`RowWithID`](../modules.md#rowwithid)) => `Promise`\<``null`` \| `string`\> |
| `vc` | [`VC`](VC.md) |
| `input` | \{ [K in string \| number \| symbol]: Value\<TTable[K]\> } & \{ [K in string \| number \| symbol]?: Value\<TTable[K]\> } & [`RowWithID`](../modules.md#rowwithid) |

#### Returns

`Promise`\<``null`` \| `string`\>

#### Defined in

[src/ent/Triggers.ts:207](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L207)

___

### wrapUpdate

▸ **wrapUpdate**(`func`, `vc`, `oldRow`, `input`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `func` | (`input`: [`UpdateInput`](../modules.md#updateinput)\<`TTable`\>) => `Promise`\<`boolean`\> |
| `vc` | [`VC`](VC.md) |
| `oldRow` | \{ [P in string \| symbol]: Readonly\<RowWithID & \{ [K in string]: Value\<TTable[K]\> } & Record\<keyof TTable & symbol, never\>\>[P] } |
| `input` | [`UpdateInput`](../modules.md#updateinput)\<`TTable`\> |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/ent/Triggers.ts:251](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L251)

___

### wrapDelete

▸ **wrapDelete**(`func`, `vc`, `oldRow`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `func` | () => `Promise`\<`boolean`\> |
| `vc` | [`VC`](VC.md) |
| `oldRow` | \{ [P in string \| symbol]: Readonly\<RowWithID & \{ [K in string]: Value\<TTable[K]\> } & Record\<keyof TTable & symbol, never\>\>[P] } |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/ent/Triggers.ts:312](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L312)
