[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / PrimitiveInstance

# Interface: PrimitiveInstance<TTable\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Hierarchy

- [`ConfigInstance`](ConfigInstance.md)

  ↳ **`PrimitiveInstance`**

  ↳↳ [`HelpersInstance`](HelpersInstance.md)

## Properties

### id

• `Readonly` **id**: `string`

For simplicity, every Ent has an ID field name hardcoded to "id".

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:36](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L36)

___

### vc

• `Readonly` **vc**: [`VC`](../classes/VC.md)

VC of this Ent.

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L31)

## Methods

### deleteOriginal

▸ **deleteOriginal**(): `Promise`<`boolean`\>

Deletes the object in the DB. Returns true if the object was found. Keeps
the current object untouched (since it's immutable).

#### Returns

`Promise`<`boolean`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:48](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L48)

___

### updateOriginal

▸ **updateOriginal**(`input`): `Promise`<`boolean`\>

Updates the object in the DB, but doesn't update the Ent itself (since it's
immutable). Returns true if the object was found.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:42](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L42)
