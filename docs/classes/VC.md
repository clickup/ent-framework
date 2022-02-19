[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / VC

# Class: VC

VC - Viewer Context.

VC is set per HTTP request (or per worker job) in each Ent and represents the
person who is about to run some database operation. It can represent a user,
or a guest, or a bot observing that Ent.

Depending on the Ent's Configuration object and privacy rules, it may allow
the user to load/insert/update/etc. or to traverse to related objects.

## Properties

### freshness

• `Readonly` **freshness**: ``null`` \| typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica)

___

### userID

• `Readonly` **userID**: `string`

## Methods

### [custom]

▸ **[custom]**(): `string`

This is to show VCs in console.log() and inspect() nicely.

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/ent/VC.ts:61](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L61)

___

### cache

▸ **cache**<`TInstance`\>(`Class`): `TInstance`

Some IDs are cached in VC (e.g. is this ID readable? is it writable? is
this VC an admin VC?). Also, people may define their own VC-local caches.

#### Type parameters

| Name |
| :------ |
| `TInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Class` | (`vc`: [`VC`](VC.md)) => `TInstance` |

#### Returns

`TInstance`

#### Defined in

[packages/ent-framework/src/ent/VC.ts:92](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L92)

▸ **cache**<`TInstance`\>(`tag`, `creator`): `TInstance`

Same as the above overload, but allows to use a custom creating function.
This is useful when e.g. cached values are async-created.

#### Type parameters

| Name |
| :------ |
| `TInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `tag` | `symbol` |
| `creator` | (`vc`: [`VC`](VC.md)) => `TInstance` |

#### Returns

`TInstance`

#### Defined in

[packages/ent-framework/src/ent/VC.ts:98](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L98)

___

### flavor

▸ **flavor**<`TFlavor`\>(`flavor`): ``null`` \| `TFlavor`

Returns VC's flavor of the particular type.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TFlavor` | extends [`VCFlavor`](VCFlavor.md)<`TFlavor`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `flavor` | (...`args`: `any`[]) => `TFlavor` |

#### Returns

``null`` \| `TFlavor`

#### Defined in

[packages/ent-framework/src/ent/VC.ts:327](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L327)

___

### isGuest

▸ **isGuest**(): `boolean`

Checks if it's a guest VC.

#### Returns

`boolean`

#### Defined in

[packages/ent-framework/src/ent/VC.ts:313](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L313)

___

### isLoggedIn

▸ **isLoggedIn**(): `boolean`

Checks if it's a regular user (i.e. owning) VC.

#### Returns

`boolean`

#### Defined in

[packages/ent-framework/src/ent/VC.ts:320](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L320)

___

### isOmni

▸ **isOmni**(): `boolean`

Checks if it's an omni VC.

#### Returns

`boolean`

#### Defined in

[packages/ent-framework/src/ent/VC.ts:306](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L306)

___

### loader

▸ **loader**<`TLoadArgs`, `TReturn`\>(`HandlerClass`): [`Loader`](Loader.md)<`TLoadArgs`, `TReturn`\>

Returns a cached instance of Loader whose actual code is defined in
HandlerClass. In case there is no such Loader yet, creates it.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TLoadArgs` | extends `any`[] |
| `TReturn` | `TReturn` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `HandlerClass` | `Object` |
| `HandlerClass.$loader?` | `symbol` |

#### Returns

[`Loader`](Loader.md)<`TLoadArgs`, `TReturn`\>

#### Defined in

[packages/ent-framework/src/ent/VC.ts:121](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L121)

___

### serializeTimelines

▸ **serializeTimelines**(): `undefined` \| `string`

Serializes shard timelines (master WAL positions) to a string format. The
method always returns a value which is compatible to
withDeserializedTimelines() input.

#### Returns

`undefined` \| `string`

#### Defined in

[packages/ent-framework/src/ent/VC.ts:153](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L153)

___

### timeline

▸ **timeline**(`shard`, `schemaName`): [`Timeline`](Timeline.md)

Returns shard+schemaName timeline which tracks replica staleness for the
particular schema name (most likely, table).

#### Parameters

| Name | Type |
| :------ | :------ |
| `shard` | [`Shard`](Shard.md)<[`Client`](Client.md)\> |
| `schemaName` | `string` |

#### Returns

[`Timeline`](Timeline.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:137](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L137)

___

### toAnnotation

▸ **toAnnotation**(): [`QueryAnnotation`](../interfaces/QueryAnnotation.md)

Returns a debug annotation of this VC.

#### Returns

[`QueryAnnotation`](../interfaces/QueryAnnotation.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:354](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L354)

___

### toLowerInternal

▸ **toLowerInternal**(`userID`): [`VC`](VC.md)

Used internally by Ent framework to lower permissions of an injected VC.
For guest, userID === null.
- freshness is always reset to default one it VC is demoted
- isRoot is changed to false once a root VC is switched to a per-user VC

#### Parameters

| Name | Type |
| :------ | :------ |
| `userID` | ``null`` \| `string` |

#### Returns

[`VC`](VC.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:384](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L384)

___

### toOmniDangerous

▸ **toOmniDangerous**(): [`VC`](VC.md)

Creates a new VC upgraded to omni permissions. This VC will not
be placed to some Ent's ent.vc property; instead, it will be
automatically downgraded to either the owning VC of this Ent or
to a guest VC (see Ent.ts).

#### Returns

[`VC`](VC.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:292](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L292)

___

### toString

▸ **toString**(): `string`

Used for debugging purposes.

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/ent/VC.ts:336](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L336)

___

### withDeserializedTimelines

▸ **withDeserializedTimelines**(...`dataStrs`): [`VC`](VC.md)

Returns the new VC derived from the current one with empty caches and with
all replication timelines restored based on the serialized info provided.

This method also has a side effect, because it reflects the changes in the
global DB state as seen by the current VC's user. It restores previously
serialized timelines to the existing VC and all its parent VCs which share
the same userID. (The latter happens, because `this.timelines` map is
passed by reference to all derived VCs starting from the one which sets
userID; see `new VC(...)` clauses all around and toLowerInternal() logic.)
The timelines are merged according to wal position (greater wal position
wins).

#### Parameters

| Name | Type |
| :------ | :------ |
| `...dataStrs` | readonly (`undefined` \| `string`)[] |

#### Returns

[`VC`](VC.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:183](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L183)

___

### withEmptyCache

▸ **withEmptyCache**(): [`VC`](VC.md)

Returns a new VC derived from the current one, but with empty cache.

#### Returns

[`VC`](VC.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:203](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L203)

___

### withFlavor

▸ **withFlavor**(`flavor`): [`VC`](VC.md)

Returns a new VC derived from the current one adding some more
flavors to it.

#### Parameters

| Name | Type |
| :------ | :------ |
| `flavor` | `undefined` \| [`VCFlavor`](VCFlavor.md) |

#### Returns

[`VC`](VC.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:258](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L258)

___

### withNewTrace

▸ **withNewTrace**(`prefix?`): [`VC`](VC.md)

Derives the VC with new trace ID.

#### Parameters

| Name | Type |
| :------ | :------ |
| `prefix?` | `string` |

#### Returns

[`VC`](VC.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:274](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L274)

___

### withOneTimeStaleReplica

▸ **withOneTimeStaleReplica**(): [`VC`](VC.md)

Returns a new VC derived from the current one, but which forces an Ent to
be loaded always from replica. Freshness is NOT inherited by Ents
(not transitive): e.g. if an Ent is loaded with STALE_REPLICA freshness,
its ent.vc will have the DEFAULT freshness.

#### Returns

[`VC`](VC.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:239](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L239)

___

### withTransitiveMasterFreshness

▸ **withTransitiveMasterFreshness**(): [`VC`](VC.md)

Returns a new VC derived from the current one, but with master freshness.
Master freshness is inherited by ent.vc after an Ent is loaded.

#### Returns

[`VC`](VC.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:218](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L218)

___

### createGuestPleaseDoNotUseCreationPointsMustBeLimited

▸ `Static` **createGuestPleaseDoNotUseCreationPointsMustBeLimited**(): [`VC`](VC.md)

Please please don't call this method except one or two core places. The
idea is that we create an "origin" VC once and then derive all other VCs
from it (possibly upgrading or downgrading permissions, controlling
master/replica read policy etc.). It's also good to trace the entire chain
of calls and reasons, why some object was accessed.

#### Returns

[`VC`](VC.md)

#### Defined in

[packages/ent-framework/src/ent/VC.ts:426](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VC.ts#L426)
