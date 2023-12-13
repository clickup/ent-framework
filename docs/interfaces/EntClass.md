[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / EntClass

# Interface: EntClass<TTable\>

A very shallow interface of Ent class (as a collection of static methods).
Used in some places where we need the very minimum from the Ent.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](../modules.md#table) = `any` |

## Constructors

### constructor

• **new EntClass**()

#### Defined in

[src/ent/types.ts:32](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L32)

## Properties

### SCHEMA

• `Readonly` **SCHEMA**: [`Schema`](../classes/Schema.md)<`TTable`, [`UniqueKey`](../modules.md#uniquekey)<`TTable`\>\>

#### Defined in

[src/ent/types.ts:27](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L27)

___

### VALIDATION

• `Readonly` **VALIDATION**: [`Validation`](../classes/Validation.md)<`TTable`\>

#### Defined in

[src/ent/types.ts:28](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L28)

___

### SHARD\_LOCATOR

• `Readonly` **SHARD\_LOCATOR**: [`ShardLocator`](../classes/ShardLocator.md)<[`Client`](../classes/Client.md), `string`\>

#### Defined in

[src/ent/types.ts:29](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L29)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[src/ent/types.ts:30](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L30)

## Methods

### loadX

▸ **loadX**(`vc`, `id`): `Promise`<[`Ent`](Ent.md)<`TTable`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`<[`Ent`](Ent.md)<`TTable`\>\>

#### Defined in

[src/ent/types.ts:33](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L33)

___

### loadNullable

▸ **loadNullable**(`vc`, `id`): `Promise`<``null`` \| [`Ent`](Ent.md)<`TTable`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| [`Ent`](Ent.md)<`TTable`\>\>

#### Defined in

[src/ent/types.ts:34](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L34)

___

### loadIfReadableNullable

▸ **loadIfReadableNullable**(`vc`, `id`): `Promise`<``null`` \| [`Ent`](Ent.md)<`TTable`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`<``null`` \| [`Ent`](Ent.md)<`TTable`\>\>

#### Defined in

[src/ent/types.ts:35](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L35)

___

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

[src/ent/types.ts:36](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L36)

___

### exists

▸ **exists**(`vc`, `where`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`ExistsInput`](../modules.md#existsinput)<`TTable`\> |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/ent/types.ts:37](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L37)

___

### select

▸ **select**(`vc`, `where`, `limit`, `order?`): `Promise`<[`Ent`](Ent.md)<`TTable`\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`Where`](../modules.md#where)<`TTable`\> |
| `limit` | `number` |
| `order?` | [`Order`](../modules.md#order)<`TTable`\> |

#### Returns

`Promise`<[`Ent`](Ent.md)<`TTable`\>[]\>

#### Defined in

[src/ent/types.ts:38](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L38)

___

### selectChunked

▸ **selectChunked**(`vc`, `where`, `chunkSize`, `limit`, `custom?`): `AsyncIterableIterator`<[`Ent`](Ent.md)<`TTable`\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`Where`](../modules.md#where)<`TTable`\> |
| `chunkSize` | `number` |
| `limit` | `number` |
| `custom?` | `Object` |

#### Returns

`AsyncIterableIterator`<[`Ent`](Ent.md)<`TTable`\>[]\>

#### Defined in

[src/ent/types.ts:44](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L44)

___

### loadByX

▸ **loadByX**(`vc`, `keys`): `Promise`<[`Ent`](Ent.md)<`TTable`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `keys` | { [K in string]: Value<TTable[K]\> } |

#### Returns

`Promise`<[`Ent`](Ent.md)<`TTable`\>\>

#### Defined in

[src/ent/types.ts:51](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L51)

___

### loadByNullable

▸ **loadByNullable**(`vc`, `input`): `Promise`<``null`` \| [`Ent`](Ent.md)<`TTable`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | { [K in string]: Value<TTable[K]\> } |

#### Returns

`Promise`<``null`` \| [`Ent`](Ent.md)<`TTable`\>\>

#### Defined in

[src/ent/types.ts:55](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L55)

___

### insert

▸ **insert**(`vc`, `input`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/ent/types.ts:59](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L59)

___

### upsert

▸ **upsert**(`vc`, `input`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../modules.md#insertinput)<`TTable`\> |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/ent/types.ts:60](https://github.com/clickup/rest-client/blob/master/src/ent/types.ts#L60)
