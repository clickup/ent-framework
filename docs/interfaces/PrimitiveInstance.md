[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PrimitiveInstance

# Interface: PrimitiveInstance\<TTable\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Hierarchy

- [`ConfigInstance`](ConfigInstance.md)

  ↳ **`PrimitiveInstance`**

  ↳↳ [`HelpersInstance`](HelpersInstance.md)

## Properties

### vc

• `Readonly` **vc**: [`VC`](../classes/VC.md)

VC of this Ent.

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:36](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L36)

___

### id

• `Readonly` **id**: `string`

For simplicity, every Ent has an ID field name hardcoded to "id".

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:41](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L41)

## Methods

### updateOriginal

▸ **updateOriginal**(`input`): `Promise`\<`boolean`\>

Updates the object in the DB, but doesn't update the Ent itself (since it's
immutable).
- This method can work with CAS; see $cas property of the passed object.
- If a special value "skip-if-someone-else-changed-updating-ent-props" is
  passed to $cas, then the list of props for CAS is brought from the input,
  and the values of these props are brought from the Ent itself (i.e. from
  `this`).
- If a special value, a list of field names, is passed to $cas, then it
  works like described above, but the list of prop names is brought from
  that list of field names.
- Returns false if there is no such object in the DB, or if CAS check
  didn't succeed.
- Returns true if the object was found and updated.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateOriginalInput`](../modules.md#updateoriginalinput)\<`TTable`\> |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:58](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L58)

___

### deleteOriginal

▸ **deleteOriginal**(): `Promise`\<`boolean`\>

Deletes the object in the DB. Returns true if the object was found. Keeps
the current object untouched (since it's immutable).

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:64](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L64)
