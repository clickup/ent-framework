[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Timeline

# Class: Timeline

Tracks replication timeline position at master per "user" and Ent.
- serialization format: "pos:expiresAt"
- wipes expired records (expiration is calculated at assignment moment)

## Constructors

### constructor

• **new Timeline**(`state?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `state` | { `pos`: `bigint` ; `expiresAt`: `number`  } \| ``"unknown"`` | `"unknown"` |

#### Defined in

[src/abstract/Timeline.ts:26](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L26)

## Methods

### deserialize

▸ `Static` **deserialize**(`data`, `prevTimeline`): [`Timeline`](Timeline.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `undefined` \| `string` |
| `prevTimeline` | ``null`` \| [`Timeline`](Timeline.md) |

#### Returns

[`Timeline`](Timeline.md)

#### Defined in

[src/abstract/Timeline.ts:32](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L32)

___

### cloneMap

▸ `Static` **cloneMap**(`timelines`): `Map`<`string`, [`Timeline`](Timeline.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `timelines` | `ReadonlyMap`<`string`, [`Timeline`](Timeline.md)\> |

#### Returns

`Map`<`string`, [`Timeline`](Timeline.md)\>

#### Defined in

[src/abstract/Timeline.ts:54](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L54)

___

### serialize

▸ **serialize**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Defined in

[src/abstract/Timeline.ts:67](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L67)

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

[src/abstract/Timeline.ts:74](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L74)

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

[src/abstract/Timeline.ts:83](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L83)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Defined in

[src/abstract/Timeline.ts:93](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L93)
