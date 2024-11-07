[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / QueryCache

# Class: QueryCache

Caches Ents loaded by a particular VC. I.e. the same query running for the
same VC twice will quickly return the same Ents. This is typically enabled on
web servers only, to deliver the fastest UI response.

## Constructors

### new QueryCache()

> **new QueryCache**(`vc`): [`QueryCache`](QueryCache.md)

Creates the QueryCache object. It enable caching only if VCWithQueryCache
was manually added to the VC by the user, otherwise caching is a no-op.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |

#### Returns

[`QueryCache`](QueryCache.md)

#### Defined in

[src/ent/QueryCache.ts:35](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L35)

## Properties

| Property | Type |
| ------ | ------ |
| `whyOff?` | `string` |

## Methods

### set()

> **set**(`EntClass`, `op`, `key`, `value`): `this`

Saves a Promise to the cache slot for `op`. If this Promise rejects, the
slot will automatically be cleared (we don't cache rejected Promises to not
have a risk of caching a transient DB error).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `EntClass` | [`AnyClass`](../type-aliases/AnyClass.md) |
| `op` | `"loadNullable"` \| `"loadByNullable"` \| `"select"` \| `"count"` \| `"exists"` |
| `key` | `string` |
| `value` | `undefined` \| `Promise`\<`unknown`\> |

#### Returns

`this`

#### Defined in

[src/ent/QueryCache.ts:56](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L56)

***

### delete()

> **delete**(`EntClass`, `ops`, `key`?): `this`

Deletes cache slots or keys for an Ent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `EntClass` | [`AnyClass`](../type-aliases/AnyClass.md) |
| `ops` | (`"loadNullable"` \| `"loadByNullable"` \| `"select"` \| `"count"` \| `"exists"`)[] |
| `key`? | `string` |

#### Returns

`this`

#### Defined in

[src/ent/QueryCache.ts:91](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L91)

***

### get()

> **get**\<`TValue`\>(`EntClass`, `op`, `key`): `undefined` \| `Promise`\<`TValue`\>

This method is non-async on intent. We store Promises in the cache, not end
values, because we want the code to join awaiting an ongoing operation in
case it's inflight already.

#### Type Parameters

| Type Parameter |
| ------ |
| `TValue` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `EntClass` | [`AnyClass`](../type-aliases/AnyClass.md) |
| `op` | `"loadNullable"` \| `"loadByNullable"` \| `"select"` \| `"count"` \| `"exists"` |
| `key` | `string` |

#### Returns

`undefined` \| `Promise`\<`TValue`\>

#### Defined in

[src/ent/QueryCache.ts:113](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L113)

***

### through()

> **through**\<`TValue`\>(`EntClass`, `op`, `key`, `creator`): `Promise`\<`TValue`\>

Read-through caching pattern.

#### Type Parameters

| Type Parameter |
| ------ |
| `TValue` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `EntClass` | [`AnyClass`](../type-aliases/AnyClass.md) |
| `op` | `"loadNullable"` \| `"loadByNullable"` \| `"select"` \| `"count"` \| `"exists"` |
| `key` | `string` |
| `creator` | () => `Promise`\<`TValue`\> |

#### Returns

`Promise`\<`TValue`\>

#### Defined in

[src/ent/QueryCache.ts:129](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L129)
