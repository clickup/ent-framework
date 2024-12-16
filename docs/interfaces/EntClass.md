[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / EntClass

# Interface: EntClass\<TTable\>

A very shallow interface of Ent class (as a collection of static methods).
Used in some places where we need the very minimum from the Ent.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) | `DesperateAny` |

## Constructors

### new EntClass()

> **new EntClass**(): [`Ent`](Ent.md)\<`TTable`\>

#### Returns

[`Ent`](Ent.md)\<`TTable`\>

#### Defined in

[src/ent/types.ts:34](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L34)

## Properties

| Property | Type |
| ------ | ------ |
| `SCHEMA` | [`Schema`](../classes/Schema.md)\<`TTable`, [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\>\> |
| `VALIDATION` | [`Validation`](../classes/Validation.md)\<`TTable`\> |
| `SHARD_LOCATOR` | [`ShardLocator`](../classes/ShardLocator.md)\<[`Client`](../classes/Client.md), `TTable`, `string`\> |
| `name` | `string` |

## Methods

### loadX()

> **loadX**(`vc`, `id`): `Promise`\<[`Ent`](Ent.md)\<`TTable`\>\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`\<[`Ent`](Ent.md)\<`TTable`\>\>

#### Defined in

[src/ent/types.ts:35](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L35)

***

### loadNullable()

> **loadNullable**(`vc`, `id`): `Promise`\<`null` \| [`Ent`](Ent.md)\<`TTable`\>\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`\<`null` \| [`Ent`](Ent.md)\<`TTable`\>\>

#### Defined in

[src/ent/types.ts:36](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L36)

***

### loadIfReadableNullable()

> **loadIfReadableNullable**(`vc`, `id`): `Promise`\<`null` \| [`Ent`](Ent.md)\<`TTable`\>\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `id` | `string` |

#### Returns

`Promise`\<`null` \| [`Ent`](Ent.md)\<`TTable`\>\>

#### Defined in

[src/ent/types.ts:37](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L37)

***

### count()

> **count**(`vc`, `where`): `Promise`\<`number`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`CountInput`](../type-aliases/CountInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/ent/types.ts:38](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L38)

***

### exists()

> **exists**(`vc`, `where`): `Promise`\<`boolean`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`ExistsInput`](../type-aliases/ExistsInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/ent/types.ts:39](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L39)

***

### select()

> **select**(`vc`, `where`, `limit`, `order`?): `Promise`\<[`Ent`](Ent.md)\<`TTable`\>[]\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`Where`](../type-aliases/Where.md)\<`TTable`\> |
| `limit` | `number` |
| `order`? | [`Order`](../type-aliases/Order.md)\<`TTable`\> |

#### Returns

`Promise`\<[`Ent`](Ent.md)\<`TTable`\>[]\>

#### Defined in

[src/ent/types.ts:40](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L40)

***

### selectChunked()

> **selectChunked**(`vc`, `where`, `chunkSize`, `limit`, `custom`?): `AsyncIterableIterator`\<[`Ent`](Ent.md)\<`TTable`\>[], `any`, `any`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `where` | [`Where`](../type-aliases/Where.md)\<`TTable`\> |
| `chunkSize` | `number` |
| `limit` | `number` |
| `custom`? | \{\} |

#### Returns

`AsyncIterableIterator`\<[`Ent`](Ent.md)\<`TTable`\>[], `any`, `any`\>

#### Defined in

[src/ent/types.ts:46](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L46)

***

### loadByX()

> **loadByX**(`vc`, `keys`): `Promise`\<[`Ent`](Ent.md)\<`TTable`\>\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `keys` | `{ [K in string]: Value<TTable[K]> }` |

#### Returns

`Promise`\<[`Ent`](Ent.md)\<`TTable`\>\>

#### Defined in

[src/ent/types.ts:53](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L53)

***

### loadByNullable()

> **loadByNullable**(`vc`, `input`): `Promise`\<`null` \| [`Ent`](Ent.md)\<`TTable`\>\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | `{ [K in string]: Value<TTable[K]> }` |

#### Returns

`Promise`\<`null` \| [`Ent`](Ent.md)\<`TTable`\>\>

#### Defined in

[src/ent/types.ts:57](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L57)

***

### insert()

> **insert**(`vc`, `input`): `Promise`\<`string`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/ent/types.ts:61](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L61)

***

### upsert()

> **upsert**(`vc`, `input`): `Promise`\<`string`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | [`InsertInput`](../type-aliases/InsertInput.md)\<`TTable`\> |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/ent/types.ts:62](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L62)
