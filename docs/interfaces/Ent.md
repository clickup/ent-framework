[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Ent

# Interface: Ent\<TTable\>

A very shallow interface of one Ent.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) | `object` |

## Properties

| Property | Type |
| ------ | ------ |
| `id` | `string` |
| `vc` | [`VC`](../classes/VC.md) |

## Methods

### deleteOriginal()

> **deleteOriginal**(): `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/ent/types.ts:72](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L72)

***

### updateOriginal()

> **updateOriginal**(`input`): `Promise`\<`boolean`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`UpdateOriginalInput`](../type-aliases/UpdateOriginalInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/ent/types.ts:73](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L73)
