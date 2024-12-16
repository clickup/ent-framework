[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / VCCaches

# Class: VCCaches\<TKey, TValue\>

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

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `expirationMs` | `number` |

#### Returns

[`VCCaches`](VCCaches.md)\<`TKey`, `TValue`\>

#### Overrides

`Map<TKey, TValue>.constructor`

#### Defined in

[src/ent/VCCaches.ts:7](https://github.com/clickup/ent-framework/blob/master/src/ent/VCCaches.ts#L7)

## Methods

### get()

> **get**(`key`): `undefined` \| `TValue`

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

#### Defined in

[src/ent/VCCaches.ts:15](https://github.com/clickup/ent-framework/blob/master/src/ent/VCCaches.ts#L15)

***

### onTick()

> **onTick**(`tickNoSinceScheduling`): `"keep"` \| `"unschedule"`

Called periodically after VC#cache() was called at least once.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `tickNoSinceScheduling` | `number` |

#### Returns

`"keep"` \| `"unschedule"`

#### Defined in

[src/ent/VCCaches.ts:26](https://github.com/clickup/ent-framework/blob/master/src/ent/VCCaches.ts#L26)
