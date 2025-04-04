[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / HelpersInstance

# Interface: HelpersInstance\<TTable\>

Defined in: [src/ent/mixins/HelpersMixin.ts:20](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/HelpersMixin.ts#L20)

## Extends

- [`PrimitiveInstance`](PrimitiveInstance.md)\<`TTable`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="vc"></a> `vc` | [`VC`](../classes/VC.md) | VC of this Ent. |
| <a id="id"></a> `id` | `string` | For simplicity, every Ent has an ID field name hardcoded to "id". |

## Methods

### updateChanged()

> **updateChanged**(`input`): `Promise`\<`null` \| `false` \| [`UpdateField`](../type-aliases/UpdateField.md)\<`TTable`\>[]\>

Defined in: [src/ent/mixins/HelpersMixin.ts:35](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/HelpersMixin.ts#L35)

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

| Parameter | Type |
| ------ | ------ |
| `input` | [`UpdateOriginalInput`](../type-aliases/UpdateOriginalInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`null` \| `false` \| [`UpdateField`](../type-aliases/UpdateField.md)\<`TTable`\>[]\>

***

### updateChangedReturningX()

> **updateChangedReturningX**\<`TEnt`\>(`this`, `input`): `Promise`\<`TEnt`\>

Defined in: [src/ent/mixins/HelpersMixin.ts:43](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/HelpersMixin.ts#L43)

Same as updateChanged(), but returns the updated Ent (or the original one
if no fields were updated).

#### Type Parameters

| Type Parameter |
| ------ |
| `TEnt` *extends* [`HelpersInstance`](HelpersInstance.md)\<`TTable`\> |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `TEnt` |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`TEnt`\>

***

### updateReturningNullable()

> **updateReturningNullable**\<`TEnt`\>(`this`, `input`): `Promise`\<`null` \| `TEnt`\>

Defined in: [src/ent/mixins/HelpersMixin.ts:52](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/HelpersMixin.ts#L52)

Same as updateOriginal(), but returns the updated Ent (or null of there
was no such Ent in the database).

#### Type Parameters

| Type Parameter |
| ------ |
| `TEnt` *extends* [`HelpersInstance`](HelpersInstance.md)\<`TTable`\> |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `TEnt` |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`null` \| `TEnt`\>

***

### updateReturningX()

> **updateReturningX**\<`TEnt`\>(`this`, `input`): `Promise`\<`TEnt`\>

Defined in: [src/ent/mixins/HelpersMixin.ts:61](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/HelpersMixin.ts#L61)

Same as updateOriginal(), but throws if the object wasn't updated or
doesn't exist after the update.

#### Type Parameters

| Type Parameter |
| ------ |
| `TEnt` *extends* [`HelpersInstance`](HelpersInstance.md)\<`TTable`\> |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `TEnt` |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`TEnt`\>

***

### updateOriginal()

> **updateOriginal**(`input`): `Promise`\<`boolean`\>

Defined in: [src/ent/mixins/PrimitiveMixin.ts:58](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L58)

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

| Parameter | Type |
| ------ | ------ |
| `input` | [`UpdateOriginalInput`](../type-aliases/UpdateOriginalInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`PrimitiveInstance`](PrimitiveInstance.md).[`updateOriginal`](PrimitiveInstance.md#updateoriginal)

***

### deleteOriginal()

> **deleteOriginal**(): `Promise`\<`boolean`\>

Defined in: [src/ent/mixins/PrimitiveMixin.ts:64](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L64)

Deletes the object in the DB. Returns true if the object was found. Keeps
the current object untouched (since it's immutable).

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`PrimitiveInstance`](PrimitiveInstance.md).[`deleteOriginal`](PrimitiveInstance.md#deleteoriginal)
