[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / IDsCache

# Class: IDsCache

## Hierarchy

- **`IDsCache`**

  ↳ [`IDsCacheReadable`](IDsCacheReadable.md)

  ↳ [`IDsCacheUpdatable`](IDsCacheUpdatable.md)

  ↳ [`IDsCacheCanReadIncomingEdge`](IDsCacheCanReadIncomingEdge.md)

## Constructors

### constructor

• **new IDsCache**()

## Methods

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

[packages/ent-framework/src/ent/IDsCache.ts:10](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/IDsCache.ts#L10)

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

[packages/ent-framework/src/ent/IDsCache.ts:14](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/IDsCache.ts#L14)

___

### has

▸ **has**(`id`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`boolean`

#### Defined in

[packages/ent-framework/src/ent/IDsCache.ts:6](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/IDsCache.ts#L6)
