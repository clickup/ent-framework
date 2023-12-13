[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / HelpersInstance

# Interface: HelpersInstance<TTable\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) |

## Hierarchy

- [`PrimitiveInstance`](PrimitiveInstance.md)<`TTable`\>

  ↳ **`HelpersInstance`**

## Properties

### vc

• `Readonly` **vc**: [`VC`](../classes/VC.md)

VC of this Ent.

#### Inherited from

[PrimitiveInstance](PrimitiveInstance.md).[vc](PrimitiveInstance.md#vc)

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:36](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L36)

___

### id

• `Readonly` **id**: `string`

For simplicity, every Ent has an ID field name hardcoded to "id".

#### Inherited from

[PrimitiveInstance](PrimitiveInstance.md).[id](PrimitiveInstance.md#id)

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:41](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L41)

## Methods

### updateChanged

▸ **updateChanged**(`input`): `Promise`<``null`` \| ``false`` \| [`UpdateField`](../modules.md#updatefield)<`TTable`\>[]\>

Same as updateOriginal(), but updates only the fields which are different
in input and in the current object.
- This method can works with CAS; see $cas property of the passed object.
  If CAS fails, returns false, the same way as updateOriginal() does.
- If there was no such Ent in the DB, returns false, the same way as
  updateOriginal() does.
- If no changed fields are detected, returns null as an indication (it's
  still falsy, but is different from the parent updateOriginal's `false`).
- Otherwise, when an update happened, returns the list of fields which were
  different and triggered that change (a truthy value). The order of fields
  in the list matches the order of fields in the Ent schema definition.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`UpdateOriginalInput`](../modules.md#updateoriginalinput)<`TTable`\> |

#### Returns

`Promise`<``null`` \| ``false`` \| [`UpdateField`](../modules.md#updatefield)<`TTable`\>[]\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:35](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L35)

___

### updateChangedReturningX

▸ **updateChangedReturningX**<`TEnt`\>(`this`, `input`): `Promise`<`TEnt`\>

Same as updateChanged(), but returns the updated Ent (or the original one
if no fields were updated).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `TEnt` |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

`Promise`<`TEnt`\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:43](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L43)

___

### updateReturningNullable

▸ **updateReturningNullable**<`TEnt`\>(`this`, `input`): `Promise`<``null`` \| `TEnt`\>

Same as updateOriginal(), but returns the updated Ent (or null of there
was no such Ent in the database).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `TEnt` |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

`Promise`<``null`` \| `TEnt`\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:52](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L52)

___

### updateReturningX

▸ **updateReturningX**<`TEnt`\>(`this`, `input`): `Promise`<`TEnt`\>

Same as updateOriginal(), but throws if the object wasn't updated or
doesn't exist after the update.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEnt` | extends [`HelpersInstance`](HelpersInstance.md)<`TTable`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `TEnt` |
| `input` | [`UpdateInput`](../modules.md#updateinput)<`TTable`\> |

#### Returns

`Promise`<`TEnt`\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:61](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/HelpersMixin.ts#L61)

___

### updateOriginal

▸ **updateOriginal**(`input`): `Promise`<`boolean`\>

Updates the object in the DB, but doesn't update the Ent itself (since it's
immutable).
- This method can works with CAS; see $cas property of the passed object.
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
| `input` | [`UpdateOriginalInput`](../modules.md#updateoriginalinput)<`TTable`\> |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[PrimitiveInstance](PrimitiveInstance.md).[updateOriginal](PrimitiveInstance.md#updateoriginal)

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:58](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L58)

___

### deleteOriginal

▸ **deleteOriginal**(): `Promise`<`boolean`\>

Deletes the object in the DB. Returns true if the object was found. Keeps
the current object untouched (since it's immutable).

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[PrimitiveInstance](PrimitiveInstance.md).[deleteOriginal](PrimitiveInstance.md#deleteoriginal)

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:64](https://github.com/clickup/rest-client/blob/master/src/ent/mixins/PrimitiveMixin.ts#L64)
