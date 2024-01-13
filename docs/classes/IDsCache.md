[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / IDsCache

# Class: IDsCache

## Hierarchy

- **`IDsCache`**

  ↳ [`IDsCacheReadable`](IDsCacheReadable.md)

  ↳ [`IDsCacheUpdatable`](IDsCacheUpdatable.md)

  ↳ [`IDsCacheCanReadIncomingEdge`](IDsCacheCanReadIncomingEdge.md)

## Constructors

### constructor

• **new IDsCache**(): [`IDsCache`](IDsCache.md)

#### Returns

[`IDsCache`](IDsCache.md)

## Methods

### has

▸ **has**(`id`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`boolean`

#### Defined in

[src/ent/IDsCache.ts:6](https://github.com/clickup/ent-framework/blob/master/src/ent/IDsCache.ts#L6)

___

### add

▸ **add**(`id`, `value?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `id` | `string` | `undefined` |
| `value` | `boolean` | `true` |

#### Returns

`void`

#### Defined in

[src/ent/IDsCache.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/IDsCache.ts#L10)

___

### get

▸ **get**(`id`): `undefined` \| `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`undefined` \| `boolean`

#### Defined in

[src/ent/IDsCache.ts:14](https://github.com/clickup/ent-framework/blob/master/src/ent/IDsCache.ts#L14)
