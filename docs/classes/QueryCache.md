[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / QueryCache

# Class: QueryCache

## Constructors

### constructor

• **new QueryCache**(`vc`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |

#### Defined in

[packages/ent-framework/src/ent/QueryCache.ts:18](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/QueryCache.ts#L18)

## Methods

### delete

▸ **delete**(`EntClass`, `ops`, `key?`): [`QueryCache`](QueryCache.md)

Deletes cache slots or keys for an Ent.

#### Parameters

| Name | Type |
| :------ | :------ |
| `EntClass` | [`AnyClass`](../modules.md#anyclass) |
| `ops` | (``"loadNullable"`` \| ``"loadByNullable"`` \| ``"select"`` \| ``"count"``)[] |
| `key?` | `string` |

#### Returns

[`QueryCache`](QueryCache.md)

#### Defined in

[packages/ent-framework/src/ent/QueryCache.ts:73](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/QueryCache.ts#L73)

___

### get

▸ **get**<`TValue`\>(`EntClass`, `op`, `key`): `undefined` \| `Promise`<`TValue`\>

This method is non-async on intent. We store Promises in the cache, not end
values, because we want the code to join awaiting an ongoing operation in
case it's inflight already.

#### Type parameters

| Name |
| :------ |
| `TValue` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `EntClass` | [`AnyClass`](../modules.md#anyclass) |
| `op` | ``"loadNullable"`` \| ``"loadByNullable"`` \| ``"select"`` \| ``"count"`` |
| `key` | `string` |

#### Returns

`undefined` \| `Promise`<`TValue`\>

#### Defined in

[packages/ent-framework/src/ent/QueryCache.ts:95](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/QueryCache.ts#L95)

___

### set

▸ **set**(`EntClass`, `op`, `key`, `value`): [`QueryCache`](QueryCache.md)

Saves a Promise to the cache slot for `op`. If this Promise rejects, the
slot will automatically be cleared (we don't cache rejected Promises to not
have a risk of caching a transient SQL error).

#### Parameters

| Name | Type |
| :------ | :------ |
| `EntClass` | [`AnyClass`](../modules.md#anyclass) |
| `op` | ``"loadNullable"`` \| ``"loadByNullable"`` \| ``"select"`` \| ``"count"`` |
| `key` | `string` |
| `value` | `undefined` \| `Promise`<`unknown`\> |

#### Returns

[`QueryCache`](QueryCache.md)

#### Defined in

[packages/ent-framework/src/ent/QueryCache.ts:34](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/QueryCache.ts#L34)

___

### through

▸ **through**<`TValue`\>(`EntClass`, `op`, `key`, `creator`): `Promise`<`TValue`\>

Read-through caching pattern.

#### Type parameters

| Name |
| :------ |
| `TValue` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `EntClass` | [`AnyClass`](../modules.md#anyclass) |
| `op` | ``"loadNullable"`` \| ``"loadByNullable"`` \| ``"select"`` \| ``"count"`` |
| `key` | `string` |
| `creator` | () => `Promise`<`TValue`\> |

#### Returns

`Promise`<`TValue`\>

#### Defined in

[packages/ent-framework/src/ent/QueryCache.ts:111](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/QueryCache.ts#L111)
