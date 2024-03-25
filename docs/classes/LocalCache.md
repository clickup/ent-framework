[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / LocalCache

# Class: LocalCache\<TValue\>

A simple key-value cache stored on the local machine.

- The expectation is that there will be not too many keys stored, since the
  background cleanup process running time to time is O(numKeysStored).
- Guarantees corruption-free writes to the keys from multiple processes
  running concurrently.
- The values which are not requested longer than approximately `expirationMs`
  are auto-removed.
- Each key is stored in an individual file under `dir`. Some temporary files
  may also appear in that directory, but eventually, they will be cleaned up,
  even if they get stuck for some time.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TValue` | extends `Object` = `never` |

## Constructors

### constructor

• **new LocalCache**\<`TValue`\>(`options`): [`LocalCache`](LocalCache.md)\<`TValue`\>

Initializes the instance.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TValue` | extends `Object` = `never` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`LocalCacheOptions`](../interfaces/LocalCacheOptions.md) |

#### Returns

[`LocalCache`](LocalCache.md)\<`TValue`\>

#### Defined in

[src/abstract/LocalCache.ts:64](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L64)

## Properties

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`\<`PickPartial`\<[`LocalCacheOptions`](../interfaces/LocalCacheOptions.md)\>\>

Default values for the constructor options.

#### Defined in

[src/abstract/LocalCache.ts:47](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L47)

___

### options

• `Readonly` **options**: `Required`\<[`LocalCacheOptions`](../interfaces/LocalCacheOptions.md)\>

LocalCache configuration options.

#### Defined in

[src/abstract/LocalCache.ts:59](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L59)

## Methods

### end

▸ **end**(): `void`

Ends the instance lifecycle (e.g. garbage recheck interval).

#### Returns

`void`

#### Defined in

[src/abstract/LocalCache.ts:75](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L75)

___

### get

▸ **get**(`key`): `Promise`\<``null`` \| `TValue`\>

Returns the value for the given key, or null if the key does not exist.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`\<``null`` \| `TValue`\>

#### Defined in

[src/abstract/LocalCache.ts:83](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L83)

___

### set

▸ **set**(`key`, `value`): `Promise`\<`void`\>

Sets the value for the given key.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `TValue` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/abstract/LocalCache.ts:102](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L102)
