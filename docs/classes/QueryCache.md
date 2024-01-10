[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / QueryCache

# Class: QueryCache

Caches Ents loaded by a particular VC. I.e. the same query running for the
same VC twice will quickly return the same Ents. This is typically enabled on
web servers only, to deliver the fastest UI response.

## Constructors

### constructor

• **new QueryCache**(`vc`)

Creates the QueryCache object. It enable caching only if VCWithQueryCache
was manually added to the VC by the user, otherwise caching is a no-op.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |

#### Defined in

[src/ent/QueryCache.ts:35](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L35)

## Properties

### whyOff

• `Optional` `Readonly` **whyOff**: `string`

#### Defined in

[src/ent/QueryCache.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L29)

## Methods

### set

▸ **set**(`EntClass`, `op`, `key`, `value`): [`QueryCache`](QueryCache.md)

Saves a Promise to the cache slot for `op`. If this Promise rejects, the
slot will automatically be cleared (we don't cache rejected Promises to not
have a risk of caching a transient SQL error).

#### Parameters

| Name | Type |
| :------ | :------ |
| `EntClass` | [`AnyClass`](../modules.md#anyclass) |
| `op` | ``"loadNullable"`` \| ``"loadByNullable"`` \| ``"select"`` \| ``"count"`` \| ``"exists"`` |
| `key` | `string` |
| `value` | `undefined` \| `Promise`<`unknown`\> |

#### Returns

[`QueryCache`](QueryCache.md)

#### Defined in

[src/ent/QueryCache.ts:56](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L56)

___

### delete

▸ **delete**(`EntClass`, `ops`, `key?`): [`QueryCache`](QueryCache.md)

Deletes cache slots or keys for an Ent.

#### Parameters

| Name | Type |
| :------ | :------ |
| `EntClass` | [`AnyClass`](../modules.md#anyclass) |
| `ops` | (``"loadNullable"`` \| ``"loadByNullable"`` \| ``"select"`` \| ``"count"`` \| ``"exists"``)[] |
| `key?` | `string` |

#### Returns

[`QueryCache`](QueryCache.md)

#### Defined in

[src/ent/QueryCache.ts:91](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L91)

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
| `op` | ``"loadNullable"`` \| ``"loadByNullable"`` \| ``"select"`` \| ``"count"`` \| ``"exists"`` |
| `key` | `string` |

#### Returns

`undefined` \| `Promise`<`TValue`\>

#### Defined in

[src/ent/QueryCache.ts:113](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L113)

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
| `op` | ``"loadNullable"`` \| ``"loadByNullable"`` \| ``"select"`` \| ``"count"`` \| ``"exists"`` |
| `key` | `string` |
| `creator` | () => `Promise`<`TValue`\> |

#### Returns

`Promise`<`TValue`\>

#### Defined in

[src/ent/QueryCache.ts:129](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L129)
