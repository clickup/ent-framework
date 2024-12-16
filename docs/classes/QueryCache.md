[**@clickup/ent-framework**](../README.md)

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

[src/ent/QueryCache.ts:36](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L36)

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
| `op` | `"loadNullable"` \| `"loadByNullable"` \| `"selectBy"` \| `"select"` \| `"count"` \| `"exists"` |
| `key` | `string` |
| `value` | `undefined` \| `Promise`\<`unknown`\> |

#### Returns

`this`

#### Defined in

[src/ent/QueryCache.ts:57](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L57)

***

### delete()

> **delete**(`EntClass`, `ops`, `key`?): `this`

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

#### Defined in

[src/ent/QueryCache.ts:93](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L93)

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
| `op` | `"loadNullable"` \| `"loadByNullable"` \| `"selectBy"` \| `"select"` \| `"count"` \| `"exists"` |
| `key` | `string` |

#### Returns

`undefined` \| `Promise`\<`TValue`\>

#### Defined in

[src/ent/QueryCache.ts:119](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L119)

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
| `op` | `"loadNullable"` \| `"loadByNullable"` \| `"selectBy"` \| `"select"` \| `"count"` \| `"exists"` |
| `key` | `string` |
| `creator` | () => `Promise`\<`TValue`\> |

#### Returns

`Promise`\<`TValue`\>

#### Defined in

[src/ent/QueryCache.ts:135](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L135)
