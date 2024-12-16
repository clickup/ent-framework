[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / VC

# Class: VC

VC - Viewer Context.

VC is set per HTTP request (or per worker job) in each Ent and represents the
person who is about to run some database operation. It can represent a user,
or a guest, or a bot observing that Ent.

Depending on the Ent's Configuration object and privacy rules, it may allow
the user to load/insert/update/etc. or to traverse to related objects.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `principal` | `string` | A principal (typically user ID) represented by this VC. |
| `freshness` | `null` \| *typeof* [`MASTER`](../variables/MASTER.md) \| *typeof* [`STALE_REPLICA`](../variables/STALE_REPLICA.md) | Allows to set VC to always use either a master or a replica DB. E.g. if freshness=MASTER, then all the timeline data is ignored, and all the requests are sent to master. |
| `heartbeater` | `object` | The heartbeat callback is called before each primitive operation. It plays the similar role as AbortController: when called, it may throw sometimes (signalled externally). Delay callback can also be passed since it's pretty common use case to wait for some time and be aborted on a heartbeat exception. |
| `heartbeater.heartbeat` | () => `Promise`\<`void`\> | - |
| `heartbeater.delay` | (`ms`: `number`) => `Promise`\<`void`\> | - |

## Methods

### createGuestPleaseDoNotUseCreationPointsMustBeLimited()

> `static` **createGuestPleaseDoNotUseCreationPointsMustBeLimited**(`__namedParameters`): [`VC`](VC.md)

Please please don't call this method except one or two core places. The
idea is that we create an "origin" VC once and then derive all other VCs
from it (possibly upgrading or downgrading permissions, controlling
master/replica read policy etc.). It's also good to trace the entire chain
of calls and reasons, why some object was accessed.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | \{ `trace`: `string`; `cachesExpirationMs`: `number`; \} |
| `__namedParameters.trace`? | `string` |
| `__namedParameters.cachesExpirationMs`? | `number` |

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:70](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L70)

***

### \[custom\]()

> **\[custom\]**(): `string`

This is to show VCs in console.log() and inspect() nicely.

#### Returns

`string`

#### Defined in

[src/ent/VC.ts:92](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L92)

***

### cache()

#### Call Signature

> **cache**\<`TInstance`\>(`Class`): `TInstance`

Some IDs are cached in VC (e.g. is this ID readable? is it writable? is
this VC an admin VC?). Also, people may define their own VC-local caches.

##### Type Parameters

| Type Parameter |
| ------ |
| `TInstance` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `Class` | (`vc`) => `TInstance` |

##### Returns

`TInstance`

##### Defined in

[src/ent/VC.ts:100](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L100)

#### Call Signature

> **cache**\<`TInstance`\>(`tag`, `creator`): `TInstance`

Same as the above overload, but allows to use a custom creating function.
This is useful when e.g. cached values are async-created.

##### Type Parameters

| Type Parameter |
| ------ |
| `TInstance` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `tag` | `symbol` |
| `creator` | (`vc`) => `TInstance` |

##### Returns

`TInstance`

##### Defined in

[src/ent/VC.ts:106](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L106)

***

### loader()

> **loader**\<`TLoadArgs`, `TReturn`\>(`HandlerClass`): [`Loader`](Loader.md)\<`TLoadArgs`, `TReturn`\>

Returns a cached instance of Loader whose actual code is defined in
HandlerClass. In case there is no such Loader yet, creates it.

#### Type Parameters

| Type Parameter |
| ------ |
| `TLoadArgs` *extends* `unknown`[] |
| `TReturn` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `HandlerClass` | (`vc`) => [`Handler`](../interfaces/Handler.md)\<`TLoadArgs`, `TReturn`\> |
| `HandlerClass.$loader`? | `symbol` |

#### Returns

[`Loader`](Loader.md)\<`TLoadArgs`, `TReturn`\>

#### Defined in

[src/ent/VC.ts:131](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L131)

***

### timeline()

> **timeline**(`shard`, `schemaName`): [`Timeline`](Timeline.md)

Returns Shard+schemaName timeline which tracks replica staleness for the
particular schema name (most likely, table).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `shard` | [`Shard`](Shard.md)\<[`Client`](Client.md)\> |
| `schemaName` | `string` |

#### Returns

[`Timeline`](Timeline.md)

#### Defined in

[src/ent/VC.ts:147](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L147)

***

### serializeTimelines()

> **serializeTimelines**(): `undefined` \| `string`

Serializes Shard timelines (master WAL positions) to a string format. The
method always returns a value which is compatible to
deserializeTimelines() input.

#### Returns

`undefined` \| `string`

#### Defined in

[src/ent/VC.ts:163](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L163)

***

### deserializeTimelines()

> **deserializeTimelines**(...`dataStrs`): [`VC`](VC.md)

Restores all replication timelines in the VC based on the serialized info
provided. Returns the new VC derived from the current one, but with empty
caches.

This method has a side effect of changing the timelines of the current VC
(and actually all parent VCs), because it reflects the changes in the
global DB state as seen by the current VC's principal. It restores
previously serialized timelines to the existing VC and all its parent VCs
which share the same principal. (The latter happens, because
`this.timelines` map is passed by reference to all derived VCs starting
from the one which sets principal; see `new VC(...)` clauses all around and
toLowerInternal() logic.) The timelines are merged according to WAL
positions (larger WAL positions win).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`dataStrs` | readonly (`undefined` \| `string`)[] |

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:195](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L195)

***

### withEmptyCache()

> **withEmptyCache**(): [`VC`](VC.md)

Returns a new VC derived from the current one, but with empty cache.

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:217](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L217)

***

### withTransitiveMasterFreshness()

> **withTransitiveMasterFreshness**(): [`VC`](VC.md)

Returns a new VC derived from the current one, but with master freshness.
Master freshness is inherited by ent.vc after an Ent is loaded.

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:234](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L234)

***

### withOneTimeStaleReplica()

> **withOneTimeStaleReplica**(): [`VC`](VC.md)

Returns a new VC derived from the current one, but which forces an Ent to
be loaded always from replica. Freshness is NOT inherited by Ents (not
transitive): e.g. if an Ent is loaded with STALE_REPLICA freshness, its
ent.vc will have the DEFAULT freshness.

Also, if an Ent is inserted with a VC of STALE_REPLICA freshness, its VC
won't remember it, so next immediate reads will go to a replica and not to
the master.

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:261](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L261)

***

### withDefaultFreshness()

> **withDefaultFreshness**(): [`VC`](VC.md)

Creates a new VC with default freshness (i.e. not sticky to master or
replica, auto-detected on request). Generally, it's not a good idea to use
this derivation since we lose some bit of internal knowledge from the past
history of the VC, but for e.g. tests or benchmarks, it's fine.

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:284](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L284)

***

### withFlavor()

#### Call Signature

> **withFlavor**(`prepend`, ...`flavors`): `this`

Returns a new VC derived from the current one adding some more flavors to
it. If no flavors were added, returns the same VC (`this`).

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `prepend` | `"prepend"` |
| ...`flavors` | (`undefined` \| [`VCFlavor`](VCFlavor.md))[] |

##### Returns

`this`

##### Defined in

[src/ent/VC.ts:305](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L305)

#### Call Signature

> **withFlavor**(...`flavors`): `this`

Returns a new VC derived from the current one adding some more flavors to
it. If no flavors were added, returns the same VC (`this`).

##### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`flavors` | (`undefined` \| [`VCFlavor`](VCFlavor.md))[] |

##### Returns

`this`

##### Defined in

[src/ent/VC.ts:306](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L306)

***

### withNewTrace()

> **withNewTrace**(`trace`): [`VC`](VC.md)

Derives the VC with new trace ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `trace` | `undefined` \| `string` |

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:343](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L343)

***

### withHeartbeater()

> **withHeartbeater**(`heartbeater`): [`VC`](VC.md)

Derives the VC with the provided heartbeater injected.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `heartbeater` | \{ `heartbeat`: () => `Promise`\<`void`\>; `delay`: (`ms`) => `Promise`\<`void`\>; \} |
| `heartbeater.heartbeat` | () => `Promise`\<`void`\> |
| `heartbeater.delay` | (`ms`) => `Promise`\<`void`\> |

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:359](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L359)

***

### toOmniDangerous()

> **toOmniDangerous**(): [`VC`](VC.md)

Creates a new VC upgraded to omni permissions. This VC will not
be placed to some Ent's ent.vc property; instead, it will be
automatically downgraded to either the owning VC of this Ent or
to a guest VC (see Ent.ts).

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:379](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L379)

***

### toGuest()

> **toGuest**(): [`VC`](VC.md)

Creates a new VC downgraded to guest permissions.

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:396](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L396)

***

### isOmni()

> **isOmni**(): `boolean`

Checks if it's an omni VC.

#### Returns

`boolean`

#### Defined in

[src/ent/VC.ts:411](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L411)

***

### isGuest()

> **isGuest**(): `boolean`

Checks if it's a guest VC.

#### Returns

`boolean`

#### Defined in

[src/ent/VC.ts:418](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L418)

***

### isLoggedIn()

> **isLoggedIn**(): `boolean`

Checks if it's a regular user (i.e. owning) VC.

#### Returns

`boolean`

#### Defined in

[src/ent/VC.ts:425](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L425)

***

### flavor()

> **flavor**\<`TFlavor`\>(`flavor`): `null` \| `TFlavor`

Returns VC's flavor of the particular type.

#### Type Parameters

| Type Parameter |
| ------ |
| `TFlavor` *extends* [`VCFlavor`](VCFlavor.md) |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `flavor` | (...`args`) => `TFlavor` |

#### Returns

`null` \| `TFlavor`

#### Defined in

[src/ent/VC.ts:432](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L432)

***

### toString()

> **toString**(`withInstanceNumber`): `string`

Used for debugging purposes.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `withInstanceNumber` | `boolean` | `false` |

#### Returns

`string`

#### Defined in

[src/ent/VC.ts:441](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L441)

***

### toAnnotation()

> **toAnnotation**(): [`QueryAnnotation`](../interfaces/QueryAnnotation.md)

Returns a debug annotation of this VC.

#### Returns

[`QueryAnnotation`](../interfaces/QueryAnnotation.md)

#### Defined in

[src/ent/VC.ts:460](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L460)

***

### toLowerInternal()

> **toLowerInternal**(`principal`): [`VC`](VC.md)

Used internally by Ent framework to lower permissions of an injected VC.
For guest, principal === null.
- freshness is always reset to default one it VC is demoted
- isRoot is changed to false once a root VC is switched to a per-user VC

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `principal` | `null` \| `string` |

#### Returns

[`VC`](VC.md)

#### Defined in

[src/ent/VC.ts:491](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L491)
