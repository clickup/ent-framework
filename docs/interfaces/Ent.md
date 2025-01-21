[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Ent

# Interface: Ent\<TTable\>

Defined in: [src/ent/types.ts:69](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L69)

A very shallow interface of one Ent.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) | `object` |

## Properties

| Property | Type |
| ------ | ------ |
| <a id="id"></a> `id` | `string` |
| <a id="vc"></a> `vc` | [`VC`](../classes/VC.md) |

## Methods

### deleteOriginal()

> **deleteOriginal**(): `Promise`\<`boolean`\>

Defined in: [src/ent/types.ts:72](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L72)

#### Returns

`Promise`\<`boolean`\>

***

### updateOriginal()

> **updateOriginal**(`input`): `Promise`\<`boolean`\>

Defined in: [src/ent/types.ts:73](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L73)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`UpdateOriginalInput`](../type-aliases/UpdateOriginalInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`boolean`\>
