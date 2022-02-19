[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Timeline

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
| `state` | ``"unknown"`` \| { `expiresAt`: `number` ; `pos`: `bigint`  } | `"unknown"` |

#### Defined in

[packages/ent-framework/src/abstract/Timeline.ts:24](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Timeline.ts#L24)

## Methods

### isCaughtUp

▸ **isCaughtUp**(`replicaPos`): [`TimelineCaughtUpReason`](../modules.md#timelinecaughtupreason)

#### Parameters

| Name | Type |
| :------ | :------ |
| `replicaPos` | `bigint` |

#### Returns

[`TimelineCaughtUpReason`](../modules.md#timelinecaughtupreason)

#### Defined in

[packages/ent-framework/src/abstract/Timeline.ts:79](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Timeline.ts#L79)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Defined in

[packages/ent-framework/src/abstract/Timeline.ts:89](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Timeline.ts#L89)

___

### serialize

▸ **serialize**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Defined in

[packages/ent-framework/src/abstract/Timeline.ts:63](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Timeline.ts#L63)

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

[packages/ent-framework/src/abstract/Timeline.ts:70](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Timeline.ts#L70)

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

[packages/ent-framework/src/abstract/Timeline.ts:52](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Timeline.ts#L52)

___

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

[packages/ent-framework/src/abstract/Timeline.ts:30](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Timeline.ts#L30)
