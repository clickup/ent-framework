[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / VCCaches

# Class: VCCaches\<TKey, TValue\>

Defined in: [src/ent/VCCaches.ts:6](https://github.com/clickup/ent-framework/blob/master/src/ent/VCCaches.ts#L6)

Holds an auto-expiring map of VC caches.

## Extends

- `Map`\<`TKey`, `TValue`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TKey` |
| `TValue` |

## Constructors

### new VCCaches()

> **new VCCaches**\<`TKey`, `TValue`\>(`expirationMs`): [`VCCaches`](VCCaches.md)\<`TKey`, `TValue`\>

Defined in: [src/ent/VCCaches.ts:7](https://github.com/clickup/ent-framework/blob/master/src/ent/VCCaches.ts#L7)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `expirationMs` | `number` |

#### Returns

[`VCCaches`](VCCaches.md)\<`TKey`, `TValue`\>

#### Overrides

`Map<TKey, TValue>.constructor`

## Methods

### get()

> **get**(`key`): `undefined` \| `TValue`

Defined in: [src/ent/VCCaches.ts:15](https://github.com/clickup/ent-framework/blob/master/src/ent/VCCaches.ts#L15)

Calls the Map's get() and defers cache clearing to the next WeakTicker
tick (i.e. schedules clearing on inactivity).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `TKey` |

#### Returns

`undefined` \| `TValue`

#### Overrides

`Map.get`

***

### onTick()

> **onTick**(`tickNoSinceScheduling`): `"keep"` \| `"unschedule"`

Defined in: [src/ent/VCCaches.ts:26](https://github.com/clickup/ent-framework/blob/master/src/ent/VCCaches.ts#L26)

Called periodically after VC#cache() was called at least once.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `tickNoSinceScheduling` | `number` |

#### Returns

`"keep"` \| `"unschedule"`
