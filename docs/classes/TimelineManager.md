[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / TimelineManager

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

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxLagMs` | `number` | Time interval after which a replica is declared as "caught up" even if it's not caught up. This is to not read from master forever when something has happened with the replica. |
| `refreshMs` | ``null`` \| `number` | Up to how often we call triggerRefresh(). |
| `triggerRefresh` | () => `Promise`<`unknown`\> | For replica Island Client, this method is called time to time to refresh the data which is later returned by currentPos(). Makes sense for connections which execute queries rarely: for them, the framework triggers the update when the fresh data is needed. |

#### Defined in

[src/abstract/TimelineManager.ts:13](https://github.com/clickup/rest-client/blob/master/src/abstract/TimelineManager.ts#L13)

## Properties

### maxLagMs

• `Readonly` **maxLagMs**: `number`

Time interval after which a replica is declared as "caught up" even if
it's not caught up. This is to not read from master forever when
something has happened with the replica.

#### Defined in

[src/abstract/TimelineManager.ts:17](https://github.com/clickup/rest-client/blob/master/src/abstract/TimelineManager.ts#L17)

## Methods

### currentPos

▸ **currentPos**(): `Promise`<`bigint`\>

Returns the current Client's replication timeline position (e.g. WAL
position).

#### Returns

`Promise`<`bigint`\>

#### Defined in

[src/abstract/TimelineManager.ts:31](https://github.com/clickup/rest-client/blob/master/src/abstract/TimelineManager.ts#L31)

___

### setCurrentPos

▸ **setCurrentPos**(`pos`): `void`

Sets the actual timeline pos. Must be called by the Client after each
interaction with the database.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pos` | `bigint` |

#### Returns

`void`

#### Defined in

[src/abstract/TimelineManager.ts:53](https://github.com/clickup/rest-client/blob/master/src/abstract/TimelineManager.ts#L53)
