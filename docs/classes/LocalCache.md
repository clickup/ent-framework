[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / LocalCache

# Class: LocalCache\<TValue\>

Defined in: [src/abstract/LocalCache.ts:45](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L45)

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

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TValue` *extends* `object` | `never` |

## Constructors

### new LocalCache()

> **new LocalCache**\<`TValue`\>(`options`): [`LocalCache`](LocalCache.md)\<`TValue`\>

Defined in: [src/abstract/LocalCache.ts:64](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L64)

Initializes the instance.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`LocalCacheOptions`](../interfaces/LocalCacheOptions.md) |

#### Returns

[`LocalCache`](LocalCache.md)\<`TValue`\>

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="default_options"></a> `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`LocalCacheOptions`](../interfaces/LocalCacheOptions.md)\>\> | Default values for the constructor options. |
| <a id="options-1"></a> `options` | `Required`\<[`LocalCacheOptions`](../interfaces/LocalCacheOptions.md)\> | LocalCache configuration options. |

## Methods

### end()

> **end**(): `void`

Defined in: [src/abstract/LocalCache.ts:78](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L78)

Ends the instance lifecycle (e.g. garbage recheck interval).

#### Returns

`void`

***

### get()

> **get**(`key`): `Promise`\<`null` \| `TValue`\>

Defined in: [src/abstract/LocalCache.ts:86](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L86)

Returns the value for the given key, or null if the key does not exist.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |

#### Returns

`Promise`\<`null` \| `TValue`\>

***

### set()

> **set**(`key`, `value`): `Promise`\<`void`\>

Defined in: [src/abstract/LocalCache.ts:105](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L105)

Sets the value for the given key.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `value` | `TValue` |

#### Returns

`Promise`\<`void`\>
