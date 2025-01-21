[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / IDsCache

# Class: `abstract` IDsCache

Defined in: [src/ent/IDsCache.ts:3](https://github.com/clickup/ent-framework/blob/master/src/ent/IDsCache.ts#L3)

## Extended by

- [`IDsCacheReadable`](IDsCacheReadable.md)
- [`IDsCacheUpdatable`](IDsCacheUpdatable.md)
- [`IDsCacheDeletable`](IDsCacheDeletable.md)
- [`IDsCacheCanReadIncomingEdge`](IDsCacheCanReadIncomingEdge.md)

## Constructors

### new IDsCache()

> **new IDsCache**(): [`IDsCache`](IDsCache.md)

#### Returns

[`IDsCache`](IDsCache.md)

## Methods

### has()

> **has**(`id`): `boolean`

Defined in: [src/ent/IDsCache.ts:6](https://github.com/clickup/ent-framework/blob/master/src/ent/IDsCache.ts#L6)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`boolean`

***

### add()

> **add**(`id`, `value`): `void`

Defined in: [src/ent/IDsCache.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/IDsCache.ts#L10)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `id` | `string` | `undefined` |
| `value` | `boolean` | `true` |

#### Returns

`void`

***

### get()

> **get**(`id`): `undefined` \| `boolean`

Defined in: [src/ent/IDsCache.ts:14](https://github.com/clickup/ent-framework/blob/master/src/ent/IDsCache.ts#L14)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`undefined` \| `boolean`
