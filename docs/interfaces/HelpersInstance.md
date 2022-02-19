[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / HelpersInstance

# Interface: HelpersInstance<TTable\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Hierarchy

- [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`\>

  ↳ **`HelpersInstance`**

## Properties

### id

• `Readonly` **id**: `string`

For simplicity, every Ent has an ID field name hardcoded to "id".

#### Inherited from

[PrimitiveInstance](PrimitiveInstance.md).[id](PrimitiveInstance.md#id)

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:36](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L36)

___

### vc

• `Readonly` **vc**: [`VC`](../classes/VC.md)

VC of this Ent.

#### Inherited from

[PrimitiveInstance](PrimitiveInstance.md).[vc](PrimitiveInstance.md#vc)

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L31)

## Methods

### deleteOriginal

▸ **deleteOriginal**(): `Promise`<`boolean`\>

Deletes the object in the DB. Returns true if the object was found. Keeps
the current object untouched (since it's immutable).

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[PrimitiveInstance](PrimitiveInstance.md).[deleteOriginal](PrimitiveInstance.md#deleteoriginal)

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:48](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L48)

___

### updateChanged

▸ **updateChanged**(`input`): `Promise`<`boolean`\>

Same as updateOriginal(), but updates only the fields which are different
in input and in the current object. If nothing is different, returns
false.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:25](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L25)

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

#### Inherited from

[PrimitiveInstance](PrimitiveInstance.md).[updateOriginal](PrimitiveInstance.md#updateoriginal)

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:42](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L42)

___

### updateReturningNullable

▸ **updateReturningNullable**<`TEnt`\>(`input`): `Promise`<``null`` \| `TEnt`\>

Same as updateOriginal(), but returns the updated Ent (or null of there
was no such Ent in the database).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

`Promise`<``null`` \| `TEnt`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L31)

___

### updateReturningX

▸ **updateReturningX**<`TEnt`\>(`input`): `Promise`<`TEnt`\>

Same as updateOriginal(), but throws if the object wasn't updated or
doesn't exist after the update.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`, `TEnt`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

`Promise`<`TEnt`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:40](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L40)
