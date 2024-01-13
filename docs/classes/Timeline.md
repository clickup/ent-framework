[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Timeline

# Class: Timeline

Tracks replication lag timeline position at master per "user" and Ent.
- serialization format: "pos:expiresAt"
- wipes expired records (expiration is calculated at assignment moment)

How replication lag (timeline) tracking works: for each
microshard+Ent+"user", we know the “last write-ahead log write position”
which that user (typically, VC#principal) made recently. This info can be
propagated through e.g. user's session and push notifications/subscriptions
channels automatically (“serialized timeline” and “timelines merging”). So
the next time the same user tries to read the data from the same Ent on the
same microshard, Ent Framework makes a choice, whether the replica is “good
enough” for this already; if not, it falls back to master read. I.e. the data
is not granular to individual Ent ID, it’s granular to the
user+Ent+microshard, and thus it is decoupled from IDs.

## Constructors

### constructor

• **new Timeline**(`state?`): [`Timeline`](Timeline.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `state` | \{ `pos`: `bigint` ; `expiresAt`: `number`  } \| ``"unknown"`` | `"unknown"` |

#### Returns

[`Timeline`](Timeline.md)

#### Defined in

[src/abstract/Timeline.ts:37](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L37)

## Methods

### deserialize

▸ **deserialize**(`data`, `prevTimeline`): [`Timeline`](Timeline.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `undefined` \| `string` |
| `prevTimeline` | ``null`` \| [`Timeline`](Timeline.md) |

#### Returns

[`Timeline`](Timeline.md)

#### Defined in

[src/abstract/Timeline.ts:43](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L43)

___

### cloneMap

▸ **cloneMap**(`timelines`): `Map`\<`string`, [`Timeline`](Timeline.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `timelines` | `ReadonlyMap`\<`string`, [`Timeline`](Timeline.md)\> |

#### Returns

`Map`\<`string`, [`Timeline`](Timeline.md)\>

#### Defined in

[src/abstract/Timeline.ts:65](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L65)

___

### serialize

▸ **serialize**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Defined in

[src/abstract/Timeline.ts:78](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L78)

___

### setPos

▸ **setPos**(`pos`, `maxLagMs`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `pos` | `bigint` |
| `maxLagMs` | `number` |

#### Returns

`void`

#### Defined in

[src/abstract/Timeline.ts:85](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L85)

___

### isCaughtUp

▸ **isCaughtUp**(`replicaPos`): [`TimelineCaughtUpReason`](../modules.md#timelinecaughtupreason)

#### Parameters

| Name | Type |
| :------ | :------ |
| `replicaPos` | `bigint` |

#### Returns

[`TimelineCaughtUpReason`](../modules.md#timelinecaughtupreason)

#### Defined in

[src/abstract/Timeline.ts:94](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L94)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Defined in

[src/abstract/Timeline.ts:104](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L104)
