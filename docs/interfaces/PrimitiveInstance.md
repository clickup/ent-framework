[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / PrimitiveInstance

# Interface: PrimitiveInstance\<TTable\>

## Extends

- [`ConfigInstance`](ConfigInstance.md)

## Extended by

- [`HelpersInstance`](HelpersInstance.md)

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) | VC of this Ent. |
| `id` | `string` | For simplicity, every Ent has an ID field name hardcoded to "id". |

## Methods

### updateOriginal()

> **updateOriginal**(`input`): `Promise`\<`boolean`\>

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

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:58](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L58)

***

### deleteOriginal()

> **deleteOriginal**(): `Promise`\<`boolean`\>

Deletes the object in the DB. Returns true if the object was found. Keeps
the current object untouched (since it's immutable).

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:64](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L64)
