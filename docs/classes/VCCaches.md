[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / VCCaches

# Class: VCCaches<TKey, TValue\>

Holds an auto-expiring map of VC caches.

## Type parameters

| Name |
| :------ |
| `TKey` |
| `TValue` |

## Hierarchy

- `Map`<`TKey`, `TValue`\>

  ↳ **`VCCaches`**

## Constructors

### constructor

• **new VCCaches**<`TKey`, `TValue`\>(`expirationMs`)

#### Type parameters

| Name |
| :------ |
| `TKey` |
| `TValue` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `expirationMs` | `number` |

#### Overrides

Map&lt;TKey, TValue\&gt;.constructor

#### Defined in

[src/ent/VCCaches.ts:7](https://github.com/clickup/ent-framework/blob/master/src/ent/VCCaches.ts#L7)

## Methods

### get

▸ **get**(`key`): `undefined` \| `TValue`

Calls the Map's get() and defers cache clearing to the next WeakTicker
tick (i.e. schedules clearing on inactivity).

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `TKey` |

#### Returns

`undefined` \| `TValue`

#### Overrides

Map.get

#### Defined in

[src/ent/VCCaches.ts:15](https://github.com/clickup/ent-framework/blob/master/src/ent/VCCaches.ts#L15)

___

### onTick

▸ **onTick**(`tickNoSinceScheduling`): ``"keep"`` \| ``"unschedule"``

Called periodically after VC#cache() was called at least once.

#### Parameters

| Name | Type |
| :------ | :------ |
| `tickNoSinceScheduling` | `number` |

#### Returns

``"keep"`` \| ``"unschedule"``

#### Defined in

[src/ent/VCCaches.ts:26](https://github.com/clickup/ent-framework/blob/master/src/ent/VCCaches.ts#L26)
