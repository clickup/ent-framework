[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / EntClass

# Interface: EntClass<TTable\>

A very shallow interface of Ent class (as a collection of static methods).
User in some places where we need the very minimum from the Ent.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) = `any` |

## Properties

### SCHEMA

• `Readonly` **SCHEMA**: [`Schema`](../classes/Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

#### Defined in

[packages/ent-framework/src/ent/types.ts:18](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/types.ts#L18)

___

### VALIDATION

• `Readonly` **VALIDATION**: [`Validation`](../classes/Validation.md)<`TTable`\>

#### Defined in

[packages/ent-framework/src/ent/types.ts:19](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/types.ts#L19)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[packages/ent-framework/src/ent/types.ts:20](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/types.ts#L20)

## Methods

### count

▸ **count**(`vc`, `where`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`CountInput`](../modules.md#countinput)<`TTable`\> |

#### Returns

`Promise`<`number`\>

#### Defined in

[packages/ent-framework/src/ent/types.ts:25](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/types.ts#L25)

___

### loadByX

▸ **loadByX**(`vc`, `keys`): `Promise`<[`Ent`](Ent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `keys` | { [K in string \| number \| symbol]: Value<TTable[K]\> } |

#### Returns

`Promise`<[`Ent`](Ent.md)\>

#### Defined in

[packages/ent-framework/src/ent/types.ts:32](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/types.ts#L32)

___

### loadIfReadableNullable

▸ **loadIfReadableNullable**(`vc`, `id`): `Promise`<``null`` \| [`Ent`](Ent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| [`Ent`](Ent.md)\>

#### Defined in

[packages/ent-framework/src/ent/types.ts:24](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/types.ts#L24)

___

### loadNullable

▸ **loadNullable**(`vc`, `id`): `Promise`<``null`` \| [`Ent`](Ent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| [`Ent`](Ent.md)\>

#### Defined in

[packages/ent-framework/src/ent/types.ts:23](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/types.ts#L23)

___

### loadX

▸ **loadX**(`vc`, `id`): `Promise`<[`Ent`](Ent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`<[`Ent`](Ent.md)\>

#### Defined in

[packages/ent-framework/src/ent/types.ts:22](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/types.ts#L22)

___

### select

▸ **select**(`vc`, `where`, `limit`, `order?`): `Promise`<[`Ent`](Ent.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`Where`](../modules.md#where)<`TTable`\> |
| `limit` | `number` |
| `order?` | [`Order`](../modules.md#order)<`TTable`\> |

#### Returns

`Promise`<[`Ent`](Ent.md)[]\>

#### Defined in

[packages/ent-framework/src/ent/types.ts:26](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/types.ts#L26)
