[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Triggers

# Class: Triggers\<TTable\>

Defined in: [src/ent/Triggers.ts:169](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L169)

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Constructors

### new Triggers()

> **new Triggers**\<`TTable`\>(`beforeInsert`, `beforeUpdate`, `beforeDelete`, `beforeMutation`, `afterInsert`, `afterUpdate`, `afterDelete`, `afterMutation`): [`Triggers`](Triggers.md)\<`TTable`\>

Defined in: [src/ent/Triggers.ts:170](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L170)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `beforeInsert` | [`InsertTrigger`](../type-aliases/InsertTrigger.md)\<`TTable`\>[] |
| `beforeUpdate` | \[`null` \| [`DepsBuilder`](../type-aliases/DepsBuilder.md)\<`TTable`\>, [`BeforeUpdateTrigger`](../type-aliases/BeforeUpdateTrigger.md)\<`TTable`\>\][] |
| `beforeDelete` | [`DeleteTrigger`](../type-aliases/DeleteTrigger.md)\<`TTable`\>[] |
| `beforeMutation` | \[`null` \| [`DepsBuilder`](../type-aliases/DepsBuilder.md)\<`TTable`\>, [`BeforeMutationTrigger`](../type-aliases/BeforeMutationTrigger.md)\<`TTable`\>\][] |
| `afterInsert` | [`InsertTrigger`](../type-aliases/InsertTrigger.md)\<`TTable`\>[] |
| `afterUpdate` | \[`null` \| [`DepsBuilder`](../type-aliases/DepsBuilder.md)\<`TTable`\>, [`AfterUpdateTrigger`](../type-aliases/AfterUpdateTrigger.md)\<`TTable`\>\][] |
| `afterDelete` | [`DeleteTrigger`](../type-aliases/DeleteTrigger.md)\<`TTable`\>[] |
| `afterMutation` | \[`null` \| [`DepsBuilder`](../type-aliases/DepsBuilder.md)\<`TTable`\>, [`AfterMutationTrigger`](../type-aliases/AfterMutationTrigger.md)\<`TTable`\>\][] |

#### Returns

[`Triggers`](Triggers.md)\<`TTable`\>

## Methods

### hasInsertTriggers()

> **hasInsertTriggers**(): `boolean`

Defined in: [src/ent/Triggers.ts:189](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L189)

#### Returns

`boolean`

***

### hasUpdateTriggers()

> **hasUpdateTriggers**(): `boolean`

Defined in: [src/ent/Triggers.ts:198](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L198)

#### Returns

`boolean`

***

### wrapInsert()

> **wrapInsert**(`func`, `vc`, `input`): `Promise`\<`null` \| `string`\>

Defined in: [src/ent/Triggers.ts:207](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L207)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `func` | (`input`) => `Promise`\<`null` \| `string`\> |
| `vc` | [`VC`](VC.md) |
| `input` | \{ \[K in string \| number \| symbol\]: Value\<TTable\[K\]\> \} & \{ \[K in string \| number \| symbol\]?: Value\<TTable\[K\]\> \} & [`RowWithID`](../type-aliases/RowWithID.md) |

#### Returns

`Promise`\<`null` \| `string`\>

***

### wrapUpdate()

> **wrapUpdate**(`func`, `vc`, `oldRow`, `input`): `Promise`\<`boolean`\>

Defined in: [src/ent/Triggers.ts:251](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L251)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `func` | (`input`) => `Promise`\<`boolean`\> |
| `vc` | [`VC`](VC.md) |
| `oldRow` | \{ \[P in string \| symbol\]: Readonly\<RowWithID & \{ \[K in string\]: Value\<TTable\[K\]\> \} & Record\<keyof TTable & symbol, never\>\>\[P\] \} |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`boolean`\>

***

### wrapDelete()

> **wrapDelete**(`func`, `vc`, `oldRow`): `Promise`\<`boolean`\>

Defined in: [src/ent/Triggers.ts:312](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L312)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `func` | () => `Promise`\<`boolean`\> |
| `vc` | [`VC`](VC.md) |
| `oldRow` | \{ \[P in string \| symbol\]: Readonly\<RowWithID & \{ \[K in string\]: Value\<TTable\[K\]\> \} & Record\<keyof TTable & symbol, never\>\>\[P\] \} |

#### Returns

`Promise`\<`boolean`\>
