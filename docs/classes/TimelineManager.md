[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / TimelineManager

# Class: TimelineManager

A side effect based container which holds the current master or replica
timeline position. For master, the expectation is that the pos will be
updated after each query only, so no need to use refreshMs. For replica, it's
also updated after each query PLUS the class will call triggerRefresh() hook
not more often than every refreshMs interval.

## Constructors

### constructor

• **new TimelineManager**(`maxLagMs`, `refreshMs`, `triggerRefresh`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `maxLagMs` | `number` |
| `refreshMs` | ``null`` \| `number` |
| `triggerRefresh` | () => `Promise`<`unknown`\> |

#### Defined in

[packages/ent-framework/src/abstract/TimelineManager.ts:13](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/TimelineManager.ts#L13)

## Properties

### maxLagMs

• `Readonly` **maxLagMs**: `number`

## Methods

### currentPos

▸ **currentPos**(): `Promise`<`bigint`\>

Returns the current Client's replication timeline position (e.g. WAL
position).

#### Returns

`Promise`<`bigint`\>

#### Defined in

[packages/ent-framework/src/abstract/TimelineManager.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/TimelineManager.ts#L31)

___

### setCurrentPos

▸ **setCurrentPos**(`pos`): `void`

Sets the actual timeline pos. Must be called by the client after each
interaction with the database.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pos` | `bigint` |

#### Returns

`void`

#### Defined in

[packages/ent-framework/src/abstract/TimelineManager.ts:53](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/TimelineManager.ts#L53)
