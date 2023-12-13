[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Ent

# Interface: Ent<TTable\>

A very shallow interface of one Ent.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) = `any` |

## Properties

### id

• `Readonly` **id**: `string`

#### Defined in

[src/ent/types.ts:67](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L67)

___

### vc

• `Readonly` **vc**: [`VC`](../classes/VC.md)

#### Defined in

[src/ent/types.ts:68](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L68)

## Methods

### deleteOriginal

▸ **deleteOriginal**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/ent/types.ts:69](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L69)

___

### updateOriginal

▸ **updateOriginal**(`input`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateOriginalInput`](../modules.md#updateoriginalinput)<`TTable`\> |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/ent/types.ts:70](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L70)
