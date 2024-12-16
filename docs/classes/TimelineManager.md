[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / TimelineManager

# Class: TimelineManager

A side effect based container which holds the current master or replica
timeline position. For master, the expectation is that the pos will be
updated after each query only, so no need to use refreshMs. For replica, it's
also updated after each query PLUS the class will call triggerRefresh() hook
not more often than every refreshMs interval.

## Constructors

### new TimelineManager()

> **new TimelineManager**(`maxLagMs`, `refreshMs`, `triggerRefresh`): [`TimelineManager`](TimelineManager.md)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `maxLagMs` | `MaybeCallable`\<`number`\> | Time interval after which a replica is declared as "caught up" even if it's not caught up. This is to not read from master forever when something has happened with the replica. |
| `refreshMs` | `MaybeCallable`\<`number`\> | Up to how often we call triggerRefresh(). |
| `triggerRefresh` | () => `Promise`\<`unknown`\> | This method is called time to time to refresh the data which is later returned by currentPos(). Makes sense for replica connections which execute queries rarely: for them, the framework triggers the update when the fresh data is needed. |

#### Returns

[`TimelineManager`](TimelineManager.md)

#### Defined in

[src/abstract/TimelineManager.ts:15](https://github.com/clickup/ent-framework/blob/master/src/abstract/TimelineManager.ts#L15)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `maxLagMs` | `MaybeCallable`\<`number`\> | Time interval after which a replica is declared as "caught up" even if it's not caught up. This is to not read from master forever when something has happened with the replica. |

## Methods

### currentPos()

> **currentPos**(): `Promise`\<`bigint`\>

Returns the current Client's replication timeline position (e.g. WAL
position).

#### Returns

`Promise`\<`bigint`\>

#### Defined in

[src/abstract/TimelineManager.ts:33](https://github.com/clickup/ent-framework/blob/master/src/abstract/TimelineManager.ts#L33)

***

### setCurrentPos()

> **setCurrentPos**(`pos`): `void`

Sets the actual timeline pos. Must be called by the Client after each
interaction with the database.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pos` | `bigint` |

#### Returns

`void`

#### Defined in

[src/abstract/TimelineManager.ts:56](https://github.com/clickup/ent-framework/blob/master/src/abstract/TimelineManager.ts#L56)
