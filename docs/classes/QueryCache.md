[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / QueryCache

# Class: QueryCache

Defined in: [src/ent/QueryCache.ts:26](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L26)

Caches Ents loaded by a particular VC. I.e. the same query running for the
same VC twice will quickly return the same Ents. This is typically enabled on
web servers only, to deliver the fastest UI response.

## Constructors

### new QueryCache()

> **new QueryCache**(`vc`): [`QueryCache`](QueryCache.md)

Defined in: [src/ent/QueryCache.ts:38](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L38)

Creates the QueryCache object. It enable caching only if VCWithQueryCache
was manually added to the VC by the user, otherwise caching is a no-op.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |

#### Returns

[`QueryCache`](QueryCache.md)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="whyoff"></a> `whyOff?` | `string` |

## Methods

### set()

> **set**(`EntClass`, `op`, `key`, `value`): `this`

Defined in: [src/ent/QueryCache.ts:59](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L59)

Saves a Promise to the cache slot for `op`. If this Promise rejects, the
slot will automatically be cleared (we don't cache rejected Promises to not
have a risk of caching a transient DB error).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `EntClass` | [`AnyClass`](../type-aliases/AnyClass.md) |
| `op` | `"loadNullable"` \| `"loadByNullable"` \| `"selectBy"` \| `"select"` \| `"count"` \| `"exists"` |
| `key` | `string` |
| `value` | `undefined` \| `Promise`\<`unknown`\> |

#### Returns

`this`

***

### delete()

> **delete**(`EntClass`, `ops`, `key`?): `this`

Defined in: [src/ent/QueryCache.ts:95](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L95)

Deletes cache slots or keys for an Ent. If key is null, skips the deletion.
If key is undefined (i.e. not passed), then deletes all slots.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `EntClass` | [`AnyClass`](../type-aliases/AnyClass.md) |
| `ops` | readonly (`"loadNullable"` \| `"loadByNullable"` \| `"selectBy"` \| `"select"` \| `"count"` \| `"exists"`)[] |
| `key`? | `null` \| `string` |

#### Returns

`this`

***

### get()

> **get**\<`TValue`\>(`EntClass`, `op`, `key`): `undefined` \| `Promise`\<`TValue`\>

Defined in: [src/ent/QueryCache.ts:121](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L121)

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
| `op` | `"loadNullable"` \| `"loadByNullable"` \| `"selectBy"` \| `"select"` \| `"count"` \| `"exists"` |
| `key` | `string` |

#### Returns

`undefined` \| `Promise`\<`TValue`\>

***

### through()

> **through**\<`TValue`\>(`EntClass`, `op`, `key`, `creator`): `Promise`\<`TValue`\>

Defined in: [src/ent/QueryCache.ts:137](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L137)

Read-through caching pattern.

#### Type Parameters

| Type Parameter |
| ------ |
| `TValue` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `EntClass` | [`AnyClass`](../type-aliases/AnyClass.md) |
| `op` | `"loadNullable"` \| `"loadByNullable"` \| `"selectBy"` \| `"select"` \| `"count"` \| `"exists"` |
| `key` | `string` |
| `creator` | () => `Promise`\<`TValue`\> |

#### Returns

`Promise`\<`TValue`\>
