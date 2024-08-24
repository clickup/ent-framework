[@clickup/ent-framework](README.md) / Exports

# @clickup/ent-framework

## Enumerations

- [RuleDecision](enums/RuleDecision.md)

## Classes

- [Batcher](classes/Batcher.md)
- [Client](classes/Client.md)
- [ClientError](classes/ClientError.md)
- [Cluster](classes/Cluster.md)
- [Island](classes/Island.md)
- [Loader](classes/Loader.md)
- [LocalCache](classes/LocalCache.md)
- [QueryBase](classes/QueryBase.md)
- [QueryPing](classes/QueryPing.md)
- [Runner](classes/Runner.md)
- [Schema](classes/Schema.md)
- [Shard](classes/Shard.md)
- [ShardError](classes/ShardError.md)
- [Timeline](classes/Timeline.md)
- [TimelineManager](classes/TimelineManager.md)
- [Configuration](classes/Configuration.md)
- [IDsCache](classes/IDsCache.md)
- [Inverse](classes/Inverse.md)
- [QueryCache](classes/QueryCache.md)
- [ShardLocator](classes/ShardLocator.md)
- [Triggers](classes/Triggers.md)
- [VC](classes/VC.md)
- [VCCaches](classes/VCCaches.md)
- [VCFlavor](classes/VCFlavor.md)
- [VCWithStacks](classes/VCWithStacks.md)
- [VCWithQueryCache](classes/VCWithQueryCache.md)
- [VCTrace](classes/VCTrace.md)
- [Validation](classes/Validation.md)
- [EntAccessError](classes/EntAccessError.md)
- [EntNotFoundError](classes/EntNotFoundError.md)
- [EntNotInsertableError](classes/EntNotInsertableError.md)
- [EntNotReadableError](classes/EntNotReadableError.md)
- [EntNotUpdatableError](classes/EntNotUpdatableError.md)
- [EntUniqueKeyError](classes/EntUniqueKeyError.md)
- [EntValidationError](classes/EntValidationError.md)
- [CanDeleteOutgoingEdge](classes/CanDeleteOutgoingEdge.md)
- [CanReadOutgoingEdge](classes/CanReadOutgoingEdge.md)
- [CanUpdateOutgoingEdge](classes/CanUpdateOutgoingEdge.md)
- [FieldIs](classes/FieldIs.md)
- [IncomingEdgeFromVCExists](classes/IncomingEdgeFromVCExists.md)
- [Or](classes/Or.md)
- [OutgoingEdgePointsToVC](classes/OutgoingEdgePointsToVC.md)
- [FuncToPredicate](classes/FuncToPredicate.md)
- [IDsCacheReadable](classes/IDsCacheReadable.md)
- [IDsCacheUpdatable](classes/IDsCacheUpdatable.md)
- [IDsCacheDeletable](classes/IDsCacheDeletable.md)
- [IDsCacheCanReadIncomingEdge](classes/IDsCacheCanReadIncomingEdge.md)
- [True](classes/True.md)
- [VCHasFlavor](classes/VCHasFlavor.md)
- [AllowIf](classes/AllowIf.md)
- [DenyIf](classes/DenyIf.md)
- [Require](classes/Require.md)
- [Rule](classes/Rule.md)
- [PgClient](classes/PgClient.md)
- [PgClientPool](classes/PgClientPool.md)
- [PgError](classes/PgError.md)
- [PgQueryCount](classes/PgQueryCount.md)
- [PgQueryDelete](classes/PgQueryDelete.md)
- [PgQueryDeleteWhere](classes/PgQueryDeleteWhere.md)
- [PgQueryExists](classes/PgQueryExists.md)
- [PgQueryIDGen](classes/PgQueryIDGen.md)
- [PgQueryInsert](classes/PgQueryInsert.md)
- [PgQueryLoad](classes/PgQueryLoad.md)
- [PgQueryLoadBy](classes/PgQueryLoadBy.md)
- [PgQuerySelect](classes/PgQuerySelect.md)
- [PgQuerySelectBy](classes/PgQuerySelectBy.md)
- [PgQueryUpdate](classes/PgQueryUpdate.md)
- [PgQueryUpsert](classes/PgQueryUpsert.md)
- [PgRunner](classes/PgRunner.md)
- [PgSchema](classes/PgSchema.md)
- [ToolPing](classes/ToolPing.md)
- [ToolScoreboard](classes/ToolScoreboard.md)

## Interfaces

- [ClientOptions](interfaces/ClientOptions.md)
- [ClientConnectionIssue](interfaces/ClientConnectionIssue.md)
- [ClientPingInput](interfaces/ClientPingInput.md)
- [ClusterOptions](interfaces/ClusterOptions.md)
- [IslandOptions](interfaces/IslandOptions.md)
- [Handler](interfaces/Handler.md)
- [LocalCacheOptions](interfaces/LocalCacheOptions.md)
- [Loggers](interfaces/Loggers.md)
- [ClientQueryLoggerProps](interfaces/ClientQueryLoggerProps.md)
- [SwallowedErrorLoggerProps](interfaces/SwallowedErrorLoggerProps.md)
- [LocateIslandErrorLoggerProps](interfaces/LocateIslandErrorLoggerProps.md)
- [Query](interfaces/Query.md)
- [QueryAnnotation](interfaces/QueryAnnotation.md)
- [SchemaClass](interfaces/SchemaClass.md)
- [EntValidationErrorInfo](interfaces/EntValidationErrorInfo.md)
- [ConfigInstance](interfaces/ConfigInstance.md)
- [ConfigClass](interfaces/ConfigClass.md)
- [HelpersInstance](interfaces/HelpersInstance.md)
- [HelpersClass](interfaces/HelpersClass.md)
- [PrimitiveInstance](interfaces/PrimitiveInstance.md)
- [Predicate](interfaces/Predicate.md)
- [RuleResult](interfaces/RuleResult.md)
- [PgClientOptions](interfaces/PgClientOptions.md)
- [PgClientConn](interfaces/PgClientConn.md)
- [PgClientPoolOptions](interfaces/PgClientPoolOptions.md)
- [ToolPingOptions](interfaces/ToolPingOptions.md)
- [ToolScoreboardOptions](interfaces/ToolScoreboardOptions.md)

## Type Aliases

### ClientRole

Ƭ **ClientRole**: ``"master"`` \| ``"replica"`` \| ``"unknown"``

Role of the Client as reported after the last successful query. If we know
for sure that the Client is a master or a replica, the role will be "master"
or "replica" correspondingly. If no queries were run by the Client yet (i.e.
we don't know the role for sure), the role is assigned to "unknown".

#### Defined in

[src/abstract/Client.ts:33](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L33)

___

### ClientErrorPostAction

Ƭ **ClientErrorPostAction**: ``"rediscover-cluster"`` \| ``"rediscover-island"`` \| ``"choose-another-client"`` \| ``"fail"``

The suggested action, what can we do when facing a ClientError.

#### Defined in

[src/abstract/ClientError.ts:7](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L7)

___

### ClientErrorKind

Ƭ **ClientErrorKind**: ``"data-on-server-is-unchanged"`` \| ``"unknown-server-state"``

Sometimes we need to know for sure, is there a chance that the query failed,
but the write was still applied in the database.

#### Defined in

[src/abstract/ClientError.ts:35](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L35)

___

### WhyClient

Ƭ **WhyClient**: `Exclude`\<[`TimelineCaughtUpReason`](modules.md#timelinecaughtupreason), ``false``\> \| ``"replica-bc-stale-replica-freshness"`` \| ``"master-bc-is-write"`` \| ``"master-bc-master-freshness"`` \| ``"master-bc-no-replicas"`` \| ``"master-bc-replica-not-caught-up"``

A reason why master or replica was chosen to send the query too. The most
noticeable ones are:
- "replica-bc-master-state-unknown": 99% of cases (since writes are rare)
- "master-bc-replica-not-caught-up": happens immediately after each write,
  until the write is propagated to replica
- "replica-bc-caught-up": must happen eventually (in 0.1-2s) after each write
- "replica-bc-pos-expired": signals that the replication lag is huge, we
  should carefully monitor this case and make sure it never happens

#### Defined in

[src/abstract/QueryAnnotation.ts:13](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryAnnotation.ts#L13)

___

### TimelineCaughtUpReason

Ƭ **TimelineCaughtUpReason**: ``false`` \| ``"replica-bc-master-state-unknown"`` \| ``"replica-bc-caught-up"`` \| ``"replica-bc-pos-expired"``

The reason why the decision that this replica timeline is "good enough" has
been made.

#### Defined in

[src/abstract/Timeline.ts:7](https://github.com/clickup/ent-framework/blob/master/src/abstract/Timeline.ts#L7)

___

### AnyClass

Ƭ **AnyClass**: (...`args`: `never`[]) => `unknown`

#### Type declaration

• (`...args`): `unknown`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `never`[] |

##### Returns

`unknown`

#### Defined in

[src/ent/QueryCache.ts:14](https://github.com/clickup/ent-framework/blob/master/src/ent/QueryCache.ts#L14)

___

### ShardAffinity

Ƭ **ShardAffinity**\<`TField`, `TF`\>: typeof [`GLOBAL_SHARD`](modules.md#global_shard) \| `TField` extends typeof [`ID`](modules.md#id) ? readonly `TF`[] : readonly [`TF`, ...TF[]]

Defines Ent Shard collocation to some Ent's field when this Ent is inserted.
- The Shard can always be Shard 0 ("global Shard"), be inferred based on the
  value in other Ent field during the insertion ("colocation"), or, in case
  colocation inference didn't succeed, be chosen pseudo-randomly at insertion
  time ("random Shard").
- E.g. a random Shard can also be chosen in case an empty array is passed to
  Shard affinity (like "always fallback"), or when a field's value points to
  a global Shard.
- Passing ID to ShardAffinity is prohibited by TS.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |
| `TF` | `Exclude`\<`TField`, typeof [`ID`](modules.md#id)\> |

#### Defined in

[src/ent/ShardAffinity.ts:19](https://github.com/clickup/ent-framework/blob/master/src/ent/ShardAffinity.ts#L19)

___

### TriggerInsertInput

Ƭ **TriggerInsertInput**\<`TTable`\>: `Flatten`\<[`InsertInput`](modules.md#insertinput)\<`TTable`\> & [`RowWithID`](modules.md#rowwithid)\>

Table -> trigger's before- and after-insert input. Below, we use InsertInput
and not Row, because before and even after some INSERT, we may still not know
some values of the row (they can be filled by the DB in e.g. autoInsert
clause). InsertInput is almost a subset of Row, but it has stricter symbol
keys: e.g. if some symbol key is non-optional in INSERT (aka doesn't have
autoInsert), it will always be required in InsertInput too.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/ent/Triggers.ts:22](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L22)

___

### TriggerUpdateInput

Ƭ **TriggerUpdateInput**\<`TTable`\>: `Flatten`\<[`UpdateInput`](modules.md#updateinput)\<`TTable`\>\>

Table -> trigger's before-update input.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/ent/Triggers.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L29)

___

### TriggerUpdateNewRow

Ƭ **TriggerUpdateNewRow**\<`TTable`\>: `Flatten`\<`Readonly`\<[`Row`](modules.md#row)\<`TTable`\> & \{ [K in keyof TTable & symbol]?: Value\<TTable[K]\> }\>\>

Table -> trigger's before- and after-update NEW row. Ephemeral (symbol)
fields may or may not be passed depending on what the user passes to the
update method.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/ent/Triggers.ts:38](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L38)

___

### TriggerUpdateOrDeleteOldRow

Ƭ **TriggerUpdateOrDeleteOldRow**\<`TTable`\>: `Flatten`\<`Readonly`\<[`Row`](modules.md#row)\<`TTable`\> & `Record`\<keyof `TTable` & `symbol`, `never`\>\>\>

Table -> trigger's before- and after-update (or delete) OLD row. Ephemeral
(symbol) fields are marked as always presented, but "never" typed, so they
will be available for dereferencing in newOrOldRow of before/after mutation
triggers without guard-checking of op value.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/ent/Triggers.ts:52](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L52)

___

### InsertTrigger

Ƭ **InsertTrigger**\<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: \{ `input`: [`TriggerInsertInput`](modules.md#triggerinsertinput)\<`TTable`\>  }) => `Promise`\<`unknown`\>

Triggers could be used to simulate "transactional best-effort behavior" in a
non-transactional combination of some services. Imagine we have a relational
database and a queue service; each time we change something in the query, we
want to schedule the ID to the queue. Queue service is faulty: if a queueing
operation fails, we don't want the data to be stored to the DB afterwards.
Queries are faulty too, but it's okay for us to have something added to the
queue even if the corresponding query failed after it (a queue worker will
just do a no-op since it anyway rechecks the source of truth in relational
DBs). Queue service is like a write-ahead log for DB which always has
not-less records than the DB. In this case, we have the following set of
triggers:

1. beforeInsert: schedules ID to the queue (ID is known, see below why)
2. beforeUpdate: schedules ID to the queue
3. afterDelete: optionally schedule ID removal to the queue (notice "after")

Notice that ID is always known in all cases, even in insertBefore triggers,
because we split an INSERT operation into gen_id+insert parts, and the
triggers are executed in between.

Triggers are invoked sequentially. Any exception thrown in a before-trigger
is propagated to the caller, and the DB operation is skipped.

Triggers for beforeInsert and beforeUpdate can change their input parameter,
the change will apply to the database.

Naming convention for trigger arguments:
1. input: whatever is passed to the operation. Notice that due to us having
   autoInsert/autoUpdate fields, the set of fields can be incomplete here!
1. oldRow: the entire row in the DB which was there before the operation. All
   the fields will be presented there.
2. newRow: a row in the DB as it will looks like after the operation. Notice
   that it can be non precise, because we don't always reload the updated row
   from the database! What we do is just field by field application of input
   properties to oldRow.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`\<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | `Object` |
| `args.input` | [`TriggerInsertInput`](modules.md#triggerinsertinput)\<`TTable`\> |

##### Returns

`Promise`\<`unknown`\>

#### Defined in

[src/ent/Triggers.ts:94](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L94)

___

### BeforeUpdateTrigger

Ƭ **BeforeUpdateTrigger**\<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: \{ `newRow`: [`TriggerUpdateNewRow`](modules.md#triggerupdatenewrow)\<`TTable`\> ; `oldRow`: [`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\> ; `input`: [`TriggerUpdateInput`](modules.md#triggerupdateinput)\<`TTable`\>  }) => `Promise`\<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`\<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | `Object` |
| `args.newRow` | [`TriggerUpdateNewRow`](modules.md#triggerupdatenewrow)\<`TTable`\> |
| `args.oldRow` | [`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\> |
| `args.input` | [`TriggerUpdateInput`](modules.md#triggerupdateinput)\<`TTable`\> |

##### Returns

`Promise`\<`unknown`\>

#### Defined in

[src/ent/Triggers.ts:99](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L99)

___

### AfterUpdateTrigger

Ƭ **AfterUpdateTrigger**\<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: \{ `newRow`: [`TriggerUpdateNewRow`](modules.md#triggerupdatenewrow)\<`TTable`\> ; `oldRow`: [`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\>  }) => `Promise`\<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`\<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | `Object` |
| `args.newRow` | [`TriggerUpdateNewRow`](modules.md#triggerupdatenewrow)\<`TTable`\> |
| `args.oldRow` | [`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\> |

##### Returns

`Promise`\<`unknown`\>

#### Defined in

[src/ent/Triggers.ts:108](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L108)

___

### DeleteTrigger

Ƭ **DeleteTrigger**\<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: \{ `oldRow`: [`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\>  }) => `Promise`\<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`\<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | `Object` |
| `args.oldRow` | [`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\> |

##### Returns

`Promise`\<`unknown`\>

#### Defined in

[src/ent/Triggers.ts:116](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L116)

___

### BeforeMutationTrigger

Ƭ **BeforeMutationTrigger**\<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: \{ `op`: ``"INSERT"`` ; `newOrOldRow`: `Readonly`\<[`TriggerInsertInput`](modules.md#triggerinsertinput)\<`TTable`\>\> ; `input`: [`TriggerInsertInput`](modules.md#triggerinsertinput)\<`TTable`\>  } \| \{ `op`: ``"UPDATE"`` ; `newOrOldRow`: [`TriggerUpdateNewRow`](modules.md#triggerupdatenewrow)\<`TTable`\> ; `input`: [`TriggerUpdateInput`](modules.md#triggerupdateinput)\<`TTable`\>  } \| \{ `op`: ``"DELETE"`` ; `newOrOldRow`: [`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\> ; `input`: `Writeable`\<[`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\>\>  }) => `Promise`\<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`\<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | \{ `op`: ``"INSERT"`` ; `newOrOldRow`: `Readonly`\<[`TriggerInsertInput`](modules.md#triggerinsertinput)\<`TTable`\>\> ; `input`: [`TriggerInsertInput`](modules.md#triggerinsertinput)\<`TTable`\>  } \| \{ `op`: ``"UPDATE"`` ; `newOrOldRow`: [`TriggerUpdateNewRow`](modules.md#triggerupdatenewrow)\<`TTable`\> ; `input`: [`TriggerUpdateInput`](modules.md#triggerupdateinput)\<`TTable`\>  } \| \{ `op`: ``"DELETE"`` ; `newOrOldRow`: [`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\> ; `input`: `Writeable`\<[`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\>\>  } |

##### Returns

`Promise`\<`unknown`\>

#### Defined in

[src/ent/Triggers.ts:123](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L123)

___

### AfterMutationTrigger

Ƭ **AfterMutationTrigger**\<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: \{ `op`: ``"INSERT"`` ; `newOrOldRow`: `Readonly`\<[`TriggerInsertInput`](modules.md#triggerinsertinput)\<`TTable`\>\>  } \| \{ `op`: ``"UPDATE"`` ; `newOrOldRow`: [`TriggerUpdateNewRow`](modules.md#triggerupdatenewrow)\<`TTable`\>  } \| \{ `op`: ``"DELETE"`` ; `newOrOldRow`: [`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\>  }) => `Promise`\<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`\<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | \{ `op`: ``"INSERT"`` ; `newOrOldRow`: `Readonly`\<[`TriggerInsertInput`](modules.md#triggerinsertinput)\<`TTable`\>\>  } \| \{ `op`: ``"UPDATE"`` ; `newOrOldRow`: [`TriggerUpdateNewRow`](modules.md#triggerupdatenewrow)\<`TTable`\>  } \| \{ `op`: ``"DELETE"`` ; `newOrOldRow`: [`TriggerUpdateOrDeleteOldRow`](modules.md#triggerupdateordeleteoldrow)\<`TTable`\>  } |

##### Returns

`Promise`\<`unknown`\>

#### Defined in

[src/ent/Triggers.ts:147](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L147)

___

### DepsBuilder

Ƭ **DepsBuilder**\<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `row`: `Flatten`\<`Readonly`\<[`Row`](modules.md#row)\<`TTable`\>\>\>) => `unknown`[] \| `Promise`\<`unknown`[]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `row`): `unknown`[] \| `Promise`\<`unknown`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `row` | `Flatten`\<`Readonly`\<[`Row`](modules.md#row)\<`TTable`\>\>\> |

##### Returns

`unknown`[] \| `Promise`\<`unknown`[]\>

#### Defined in

[src/ent/Triggers.ts:164](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L164)

___

### LoadRule

Ƭ **LoadRule**\<`TInput`\>: [`AllowIf`](classes/AllowIf.md)\<`TInput`\> \| [`DenyIf`](classes/DenyIf.md)\<`TInput`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TInput` | extends `object` |

#### Defined in

[src/ent/Validation.ts:25](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L25)

___

### WriteRules

Ƭ **WriteRules**\<`TInput`\>: [] \| [[`Require`](classes/Require.md)\<`TInput`\>, ...Require\<TInput\>[]] \| [[`LoadRule`](modules.md#loadrule)\<`TInput`\>, [`Require`](classes/Require.md)\<`TInput`\>, ...Require\<TInput\>[]] \| [[`LoadRule`](modules.md#loadrule)\<`TInput`\>, [`LoadRule`](modules.md#loadrule)\<`TInput`\>, [`Require`](classes/Require.md)\<`TInput`\>, ...Require\<TInput\>[]] \| [[`LoadRule`](modules.md#loadrule)\<`TInput`\>, [`LoadRule`](modules.md#loadrule)\<`TInput`\>, [`LoadRule`](modules.md#loadrule)\<`TInput`\>, [`Require`](classes/Require.md)\<`TInput`\>, ...Require\<TInput\>[]] \| [[`LoadRule`](modules.md#loadrule)\<`TInput`\>, [`LoadRule`](modules.md#loadrule)\<`TInput`\>, [`LoadRule`](modules.md#loadrule)\<`TInput`\>, [`LoadRule`](modules.md#loadrule)\<`TInput`\>, [`Require`](classes/Require.md)\<`TInput`\>, ...Require\<TInput\>[]]

For safety, we enforce all Require rules to be in the end of the
insert/update/delete privacy list, and have at least one of them. In
TypeScript, it's not possible to create [...L[], R, ...R[]] type
(double-variadic) when both L[] and R[] are open-ended (i.e. tuples with
unknown length), so we have to brute-force.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TInput` | extends `object` |

#### Defined in

[src/ent/Validation.ts:34](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L34)

___

### ValidationRules

Ƭ **ValidationRules**\<`TTable`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `tenantPrincipalField?` | [`InsertFieldsRequired`](modules.md#insertfieldsrequired)\<`TTable`\> & `string` |
| `inferPrincipal` | (`vc`: [`VC`](classes/VC.md), `row`: [`Row`](modules.md#row)\<`TTable`\>) => `Promise`\<[`VC`](classes/VC.md)\> |
| `load` | [`Validation`](classes/Validation.md)\<`TTable`\>[``"load"``] |
| `insert` | [`Validation`](classes/Validation.md)\<`TTable`\>[``"insert"``] |
| `update?` | [`Validation`](classes/Validation.md)\<`TTable`\>[``"update"``] |
| `delete?` | [`Validation`](classes/Validation.md)\<`TTable`\>[``"delete"``] |
| `validate?` | [`Predicate`](interfaces/Predicate.md)\<[`InsertInput`](modules.md#insertinput)\<`TTable`\>\> & [`EntValidationErrorInfo`](interfaces/EntValidationErrorInfo.md)[] |

#### Defined in

[src/ent/Validation.ts:60](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L60)

___

### PrimitiveClass

Ƭ **PrimitiveClass**\<`TTable`, `TUniqueKey`, `TClient`\>: `OmitNew`\<[`ConfigClass`](interfaces/ConfigClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>\> & () => [`PrimitiveInstance`](interfaces/PrimitiveInstance.md)\<`TTable`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)\<`TTable`\> |
| `TClient` | extends [`Client`](classes/Client.md) |

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:67](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L67)

___

### EntClass

Ƭ **EntClass**\<`TTable`\>: `Object`

A very shallow interface of Ent class (as a collection of static methods).
Used in some places where we need the very minimum from the Ent.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) = `DesperateAny` |

#### Call signature

• **new EntClass**(): [`Ent`](modules.md#ent)\<`TTable`\>

##### Returns

[`Ent`](modules.md#ent)\<`TTable`\>

#### Type declaration

| Name | Type |
| :------ | :------ |
| `SCHEMA` | [`Schema`](classes/Schema.md)\<`TTable`\> |
| `VALIDATION` | [`Validation`](classes/Validation.md)\<`TTable`\> |
| `SHARD_LOCATOR` | [`ShardLocator`](classes/ShardLocator.md)\<[`Client`](classes/Client.md), `TTable`, `string`\> |
| `name` | `string` |
| `loadX` | (`vc`: [`VC`](classes/VC.md), `id`: `string`) => `Promise`\<[`Ent`](modules.md#ent)\<`TTable`\>\> |
| `loadNullable` | (`vc`: [`VC`](classes/VC.md), `id`: `string`) => `Promise`\<``null`` \| [`Ent`](modules.md#ent)\<`TTable`\>\> |
| `loadIfReadableNullable` | (`vc`: [`VC`](classes/VC.md), `id`: `string`) => `Promise`\<``null`` \| [`Ent`](modules.md#ent)\<`TTable`\>\> |
| `count` | (`vc`: [`VC`](classes/VC.md), `where`: [`CountInput`](modules.md#countinput)\<`TTable`\>) => `Promise`\<`number`\> |
| `exists` | (`vc`: [`VC`](classes/VC.md), `where`: [`ExistsInput`](modules.md#existsinput)\<`TTable`\>) => `Promise`\<`boolean`\> |
| `select` | (`vc`: [`VC`](classes/VC.md), `where`: [`Where`](modules.md#where)\<`TTable`\>, `limit`: `number`, `order?`: [`Order`](modules.md#order)\<`TTable`\>) => `Promise`\<[`Ent`](modules.md#ent)\<`TTable`\>[]\> |
| `selectChunked` | (`vc`: [`VC`](classes/VC.md), `where`: [`Where`](modules.md#where)\<`TTable`\>, `chunkSize`: `number`, `limit`: `number`, `custom?`: {}) => `AsyncIterableIterator`\<[`Ent`](modules.md#ent)\<`TTable`\>[]\> |
| `loadByX` | (`vc`: [`VC`](classes/VC.md), `keys`: \{ [K in string]: Value\<TTable[K]\> }) => `Promise`\<[`Ent`](modules.md#ent)\<`TTable`\>\> |
| `loadByNullable` | (`vc`: [`VC`](classes/VC.md), `input`: \{ [K in string]: Value\<TTable[K]\> }) => `Promise`\<``null`` \| [`Ent`](modules.md#ent)\<`TTable`\>\> |
| `insert` | (`vc`: [`VC`](classes/VC.md), `input`: [`InsertInput`](modules.md#insertinput)\<`TTable`\>) => `Promise`\<`string`\> |
| `upsert` | (`vc`: [`VC`](classes/VC.md), `input`: [`InsertInput`](modules.md#insertinput)\<`TTable`\>) => `Promise`\<`string`\> |

#### Defined in

[src/ent/types.ts:27](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L27)

___

### Ent

Ƭ **Ent**\<`TTable`\>: `Object`

A very shallow interface of one Ent.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) = {} |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `vc` | [`VC`](classes/VC.md) |
| `deleteOriginal` | () => `Promise`\<`boolean`\> |
| `updateOriginal` | (`input`: [`UpdateOriginalInput`](modules.md#updateoriginalinput)\<`TTable`\>) => `Promise`\<`boolean`\> |

#### Defined in

[src/ent/types.ts:67](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L67)

___

### UpdateOriginalInput

Ƭ **UpdateOriginalInput**\<`TTable`\>: \{ [K in UpdateField\<TTable\>]?: Value\<TTable[K]\> } & \{ `$literal?`: [`Literal`](modules.md#literal) ; `$cas?`: ``"skip-if-someone-else-changed-updating-ent-props"`` \| `ReadonlyArray`\<[`UpdateField`](modules.md#updatefield)\<`TTable`\>\> \| [`UpdateInput`](modules.md#updateinput)\<`TTable`\>[``"$cas"``]  }

The input of updateOriginal() method. It supports some additional syntax
sugar for $cas property, so to work-around TS weakness of Omit<> & type
inference, we redefine this type from scratch.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/ent/types.ts:79](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L79)

___

### PgClientPoolConn

Ƭ **PgClientPoolConn**: [`PgClientConn`](interfaces/PgClientConn.md) & \{ `processID?`: `number` \| ``null`` ; `closeAt?`: `number`  }

Our extension to Pool connection which adds a couple props to the connection
in on("connect") handler (persistent for the same connection objects, i.e.
across queries in the same connection).

#### Defined in

[src/pg/PgClientPool.ts:38](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClientPool.ts#L38)

___

### SelectInputCustom

Ƭ **SelectInputCustom**: \{ `ctes?`: [`Literal`](modules.md#literal)[] ; `joins?`: [`Literal`](modules.md#literal)[] ; `from?`: [`Literal`](modules.md#literal) ; `hints?`: `Record`\<`string`, `string`\>  } \| `undefined`

This is mostly to do hacks in PostgreSQL queries. Not even exposed by Ent
framework, but can be used by PG-dependent code.

#### Defined in

[src/pg/PgQuerySelect.ts:34](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelect.ts#L34)

___

### Literal

Ƭ **Literal**: (`string` \| `number` \| `boolean` \| `Date` \| ``null`` \| (`string` \| `number` \| `boolean` \| `Date` \| ``null``)[])[]

Literal operation with placeholders. We don't use a tuple type here (like
`[string, ...T[]]`), because it would force us to use `as const` everywhere,
which we don't want to do.

#### Defined in

[src/types.ts:14](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L14)

___

### RowWithID

Ƭ **RowWithID**: `Object`

{ id: string }

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Defined in

[src/types.ts:33](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L33)

___

### SpecType

Ƭ **SpecType**: typeof `Boolean` \| typeof `Date` \| typeof [`ID`](modules.md#id) \| typeof `Number` \| typeof `String` \| \{ `dbValueToJs`: (`dbValue`: `DesperateAny`) => `unknown` ; `stringify`: (`jsValue`: `DesperateAny`) => `string` ; `parse`: (`str`: `string`) => `unknown`  }

Spec (metadata) of some field.

#### Defined in

[src/types.ts:40](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L40)

___

### Spec

Ƭ **Spec**: `Object`

{ type: ..., ... } - one attribute spec.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`SpecType`](modules.md#spectype) |
| `allowNull?` | ``true`` |
| `autoInsert?` | `string` |
| `autoUpdate?` | `string` |

#### Defined in

[src/types.ts:78](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L78)

___

### Table

Ƭ **Table**: `Object`

{ id: Spec, name: Spec, ... } - table columns.

#### Index signature

▪ [K: `string` \| `symbol`]: [`Spec`](modules.md#spec)

#### Defined in

[src/types.ts:88](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L88)

___

### Field

Ƭ **Field**\<`TTable`\>: keyof `TTable` & `string`

A database table's field (no symbols). In regards to some table structure,
there can be 3 options:
1. Field<TTable>: only DB-stored attributes, no ephemeral symbols
2. keyof TTable: both real and ephemeral attributes
3. keyof TTable & symbol: only "ephemeral" attributes available to triggers

By doing `& string`, we ensure that we select only regular (non-symbol)
fields.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:102](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L102)

___

### FieldAliased

Ƭ **FieldAliased**\<`TTable`\>: [`Field`](modules.md#field)\<`TTable`\> \| \{ `field`: [`Field`](modules.md#field)\<`TTable`\> ; `alias`: `string`  }

Same as Field, but may optionally hold information about of "alias value
source" for a field name (e.g. `{ field: "abc", alias: "$cas.abc" }`).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:108](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L108)

___

### FieldOfPotentialUniqueKey

Ƭ **FieldOfPotentialUniqueKey**\<`TTable`\>: \{ [K in Field\<TTable\>]: TTable[K] extends Object ? K : never }[[`Field`](modules.md#field)\<`TTable`\>]

(Table) -> "field1" | "field2" | ... where the union contains only fields
which can potentially be used as a part of unique key.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:116](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L116)

___

### FieldOfIDType

Ƭ **FieldOfIDType**\<`TTable`\>: \{ [K in Field\<TTable\>]: K extends string ? TTable[K] extends Object ? K : never : never }[[`Field`](modules.md#field)\<`TTable`\>]

Table -> "user_id" | "some_id" | ...

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:128](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L128)

___

### FieldOfIDTypeRequired

Ƭ **FieldOfIDTypeRequired**\<`TTable`\>: [`InsertFieldsRequired`](modules.md#insertfieldsrequired)\<`TTable`\> & [`FieldOfIDType`](modules.md#fieldofidtype)\<`TTable`\>

Table -> "user_id" | "some_id" | ...

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:139](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L139)

___

### ValueRequired

Ƭ **ValueRequired**\<`TSpec`\>: `TSpec`[``"type"``] extends typeof `Number` ? `number` : `TSpec`[``"type"``] extends typeof `String` ? `string` : `TSpec`[``"type"``] extends typeof `Boolean` ? `boolean` : `TSpec`[``"type"``] extends typeof [`ID`](modules.md#id) ? `string` : `TSpec`[``"type"``] extends typeof `Date` ? `Date` : `TSpec`[``"type"``] extends \{ `dbValueToJs`: (`dbValue`: `never`) => infer TJSValue  } ? `TSpec`[``"type"``] extends \{ `stringify`: (`jsValue`: `TJSValue`) => `string` ; `parse`: (`str`: `string`) => `TJSValue`  } ? `TJSValue` : `never` : `never`

SpecType -> Value deduction (always deduces non-nullable type).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TSpec` | extends [`Spec`](modules.md#spec) |

#### Defined in

[src/types.ts:145](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L145)

___

### Value

Ƭ **Value**\<`TSpec`\>: `TSpec` extends \{ `allowNull`: ``true``  } ? [`ValueRequired`](modules.md#valuerequired)\<`TSpec`\> \| ``null`` : [`ValueRequired`](modules.md#valuerequired)\<`TSpec`\>

Spec -> nullable Value or non-nullable Value.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TSpec` | extends [`Spec`](modules.md#spec) |

#### Defined in

[src/types.ts:170](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L170)

___

### Row

Ƭ **Row**\<`TTable`\>: [`RowWithID`](modules.md#rowwithid) & \{ [K in Field\<TTable\>]: Value\<TTable[K]\> }

Table -> Row deduction (no symbols).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:177](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L177)

___

### InsertFieldsRequired

Ƭ **InsertFieldsRequired**\<`TTable`\>: \{ [K in keyof TTable]: TTable[K] extends Object ? never : TTable[K] extends Object ? never : K }[keyof `TTable`]

Insert: Table -> "field1" | "field2" |  ... deduction (required).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:184](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L184)

___

### InsertFieldsOptional

Ƭ **InsertFieldsOptional**\<`TTable`\>: \{ [K in keyof TTable]: TTable[K] extends Object ? K : TTable[K] extends Object ? K : never }[keyof `TTable`]

Insert: Table -> "created_at" | "field2" |  ... deduction (optional fields).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:195](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L195)

___

### InsertInput

Ƭ **InsertInput**\<`TTable`\>: \{ [K in InsertFieldsRequired\<TTable\>]: Value\<TTable[K]\> } & \{ [K in InsertFieldsOptional\<TTable\>]?: Value\<TTable[K]\> }

Insert: Table -> { field: string, updated_at?: Date, created_at?: Date... }.
Excludes id Spec entirely and makes autoInsert/autoUpdate Specs optional.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:207](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L207)

___

### UpdateField

Ƭ **UpdateField**\<`TTable`\>: `Exclude`\<keyof `TTable`, keyof [`RowWithID`](modules.md#rowwithid)\>

Update: Table -> "field1" | "created_at" | "updated_at" | ... deduction.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:216](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L216)

___

### UpdateInput

Ƭ **UpdateInput**\<`TTable`\>: \{ [K in UpdateField\<TTable\>]?: Value\<TTable[K]\> } & \{ `$literal?`: [`Literal`](modules.md#literal) ; `$cas?`: \{ [K in UpdateField\<TTable\>]?: Value\<TTable[K]\> }  }

Update: Table -> { field?: string, created_at?: Date, updated_at?: Date }.
- Excludes id Spec entirely and makes all fields optional.
- If $literal is passed, it will be appended to the list of updating fields
  (engine specific).
- If $cas is passed, only the rows whose fields match the exact values in
  $cas will be updated; the non-matching rows will be skipped.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:229](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L229)

___

### UniqueKey

Ƭ **UniqueKey**\<`TTable`\>: [] \| [[`FieldOfPotentialUniqueKey`](modules.md#fieldofpotentialuniquekey)\<`TTable`\>, ...FieldOfPotentialUniqueKey\<TTable\>[]]

Table -> ["field1", "field2", ...], list of fields allowed to compose an
unique key on the table; fields must be allowed in insert/upsert.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:240](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L240)

___

### LoadByInput

Ƭ **LoadByInput**\<`TTable`, `TUniqueKey`\>: `TUniqueKey` extends [] ? `never` : \{ [K in TUniqueKey[number]]: Value\<TTable[K]\> }

(Table, UniqueKey) -> { field1: number, field2: number, field3: number }.
loadBy operation is allowed for exact unique key attributes only.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)\<`TTable`\> |

#### Defined in

[src/types.ts:251](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L251)

___

### SelectByInput

Ƭ **SelectByInput**\<`TTable`, `TUniqueKey`\>: [`LoadByInput`](modules.md#loadbyinput)\<`TTable`, `TuplePrefixes`\<`TUniqueKey`\>\>

(Table, UniqueKey) -> { field1: number [, field2: number [, ...] ] }.
selectBy operation is allowed for unique key PREFIX attributes only.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)\<`TTable`\> |

#### Defined in

[src/types.ts:262](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L262)

___

### Where

Ƭ **Where**\<`TTable`\>: \{ `$and?`: `ReadonlyArray`\<[`Where`](modules.md#where)\<`TTable`\>\> ; `$or?`: `ReadonlyArray`\<[`Where`](modules.md#where)\<`TTable`\>\> ; `$not?`: [`Where`](modules.md#where)\<`TTable`\> ; `$literal?`: [`Literal`](modules.md#literal) ; `$shardOfID?`: `string`  } & \{ `id?`: `TTable` extends \{ `id`: `unknown`  } ? `unknown` : `string` \| `string`[]  } & \{ [K in Field\<TTable\>]?: Value\<TTable[K]\> \| ReadonlyArray\<Value\<TTable[K]\>\> \| Object \| Object \| Object \| Object \| Object \| Object \| Object }

Table -> { f: 10, [$or]: [ { f2: "a }, { f3: "b""} ], $literal: ["x=?", 1] }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:270](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L270)

___

### Order

Ƭ **Order**\<`TTable`\>: `ReadonlyArray`\<\{ [K in Field\<TTable\>]?: string } & \{ `$literal?`: [`Literal`](modules.md#literal)  }\>

Table -> [["f1", "ASC"], ["f2", "DESC"]] or [ [{[$literal]: ["a=?", 10]},
"ASC"], ["b", "DESC"] ]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:304](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L304)

___

### SelectInput

Ƭ **SelectInput**\<`TTable`\>: `Object`

Table -> { where: ..., order?: ..., ... }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `where` | [`Where`](modules.md#where)\<`TTable`\> |
| `order?` | [`Order`](modules.md#order)\<`TTable`\> |
| `custom?` | {} |
| `limit` | `number` |

#### Defined in

[src/types.ts:311](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L311)

___

### CountInput

Ƭ **CountInput**\<`TTable`\>: [`Where`](modules.md#where)\<`TTable`\>

Table -> { f: 10, [$or]: [ { f2: "a }, { f3: "b""} ], $literal: ["x=?", 1] }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:321](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L321)

___

### ExistsInput

Ƭ **ExistsInput**\<`TTable`\>: [`Where`](modules.md#where)\<`TTable`\>

Table -> { f: 10, [$or]: [ { f2: "a }, { f3: "b""} ], $literal: ["x=?", 1] }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:326](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L326)

___

### DeleteWhereInput

Ƭ **DeleteWhereInput**\<`TTable`\>: \{ `id`: `string`[]  } & `Omit`\<[`Where`](modules.md#where)\<`TTable`\>, typeof [`ID`](modules.md#id)\>

Table -> { id: ["1", "2", "3"], ... }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[src/types.ts:331](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L331)

## Variables

### MASTER

• `Const` **MASTER**: typeof [`MASTER`](modules.md#master)

Master freshness: reads always go to master.

#### Defined in

[src/abstract/Shard.ts:11](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L11)

___

### STALE\_REPLICA

• `Const` **STALE\_REPLICA**: typeof [`STALE_REPLICA`](modules.md#stale_replica)

Stale replica freshness: reads always go to a replica, even if it's stale.

#### Defined in

[src/abstract/Shard.ts:16](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L16)

___

### GLOBAL\_SHARD

• `Const` **GLOBAL\_SHARD**: ``"global_shard"``

The table is located in the global Shard (0).

#### Defined in

[src/ent/ShardAffinity.ts:6](https://github.com/clickup/ent-framework/blob/master/src/ent/ShardAffinity.ts#L6)

___

### GUEST\_ID

• `Const` **GUEST\_ID**: ``"guest"``

Guest VC: has minimum permissions. Typically if the user is not logged in,
this VC is used.

#### Defined in

[src/ent/VC.ts:22](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L22)

___

### OMNI\_ID

• `Const` **OMNI\_ID**: ``"omni"``

Temporary "omniscient" VC. Any Ent can be loaded with it, but this VC is
replaced with lower-pri VC as soon as possible. E.g. when some Ent is loaded
with omni VC, its ent.vc is assigned to either this Ent's "owner" VC
(accessible via VC pointing field) or, if not detected, to guest VC.

#### Defined in

[src/ent/VC.ts:30](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L30)

___

### ID

• `Const` **ID**: ``"id"``

Primary key field's name is currently hardcoded for simplicity. It's a
convention to have it named as "id".

#### Defined in

[src/types.ts:7](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L7)

## Functions

### BaseEnt

▸ **BaseEnt**\<`TTable`, `TUniqueKey`, `TClient`\>(`cluster`, `schema`): [`HelpersClass`](interfaces/HelpersClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

This is a helper function to create new Ent classes. Run once per each
Ent+Cluster on app boot. See examples in __tests__/TestObjects.ts and
EntTest.ts.

Since all Ent objects are immutable (following the modern practices),
1. Ent is not a DataMapper pattern;
2. Ent is not an ActiveRecord;
3. At last, Ent is not quite a DAO pattern too.

We assume that Ents are very simple (we don't need triggers or multi-ent
touching mutations), because we anyway have a GraphQL layer on top of it.

Finally, a naming decision has been made: we translate database field names
directly to Ent field names, no camelCase. This has proven its simplicity
benefits in the past: the less translation layers we have, the easier it is
to debug and develop.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)\<`TTable`\> |
| `TClient` | extends [`Client`](classes/Client.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `cluster` | [`Cluster`](classes/Cluster.md)\<`TClient`, `any`\> |
| `schema` | [`Schema`](classes/Schema.md)\<`TTable`, `TUniqueKey`\> |

#### Returns

[`HelpersClass`](interfaces/HelpersClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

#### Defined in

[src/ent/BaseEnt.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/BaseEnt.ts#L29)

___

### buildUpdateNewRow

▸ **buildUpdateNewRow**\<`TTable`\>(`oldRow`, `input`): [`TriggerUpdateNewRow`](modules.md#triggerupdatenewrow)\<`TTable`\>

Simulates an update for a row, as if it's applied to the Ent.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `oldRow` | [`Row`](modules.md#row)\<`TTable`\> |
| `input` | [`UpdateInput`](modules.md#updateinput)\<`TTable`\> |

#### Returns

[`TriggerUpdateNewRow`](modules.md#triggerupdatenewrow)\<`TTable`\>

#### Defined in

[src/ent/Triggers.ts:354](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L354)

___

### CacheMixin

▸ **CacheMixin**\<`TTable`, `TUniqueKey`, `TClient`\>(`Base`): [`PrimitiveClass`](modules.md#primitiveclass)\<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding VC-stored cache layer to it.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)\<`TTable`\> |
| `TClient` | extends [`Client`](classes/Client.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Base` | [`PrimitiveClass`](modules.md#primitiveclass)\<`TTable`, `TUniqueKey`, `TClient`\> |

#### Returns

[`PrimitiveClass`](modules.md#primitiveclass)\<`TTable`, `TUniqueKey`, `TClient`\>

#### Defined in

[src/ent/mixins/CacheMixin.ts:20](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/CacheMixin.ts#L20)

___

### ConfigMixin

▸ **ConfigMixin**\<`TTable`, `TUniqueKey`, `TClient`\>(`Base`, `cluster`, `schema`): [`ConfigClass`](interfaces/ConfigClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding support for Ent configuration (such as:
Cluster, table schema, privacy rules, triggers etc.).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)\<`TTable`\> |
| `TClient` | extends [`Client`](classes/Client.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Base` | () => {} |
| `cluster` | [`Cluster`](classes/Cluster.md)\<`TClient`, `any`\> |
| `schema` | [`Schema`](classes/Schema.md)\<`TTable`, `TUniqueKey`\> |

#### Returns

[`ConfigClass`](interfaces/ConfigClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

#### Defined in

[src/ent/mixins/ConfigMixin.ts:86](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L86)

___

### HelpersMixin

▸ **HelpersMixin**\<`TTable`, `TUniqueKey`, `TClient`\>(`Base`): [`HelpersClass`](interfaces/HelpersClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding convenience methods (like loadX() which
throws when an Ent can't be loaded instead of returning null as it's done in
the primitive operations).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)\<`TTable`\> |
| `TClient` | extends [`Client`](classes/Client.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Base` | [`PrimitiveClass`](modules.md#primitiveclass)\<`TTable`, `TUniqueKey`, `TClient`\> |

#### Returns

[`HelpersClass`](interfaces/HelpersClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

#### Defined in

[src/ent/mixins/HelpersMixin.ts:138](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/HelpersMixin.ts#L138)

___

### PrimitiveMixin

▸ **PrimitiveMixin**\<`TTable`, `TUniqueKey`, `TClient`\>(`Base`): [`PrimitiveClass`](modules.md#primitiveclass)\<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding support for the minimal number of basic Ent
operations. Internally, uses Schema abstractions to run them.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)\<`TTable`\> |
| `TClient` | extends [`Client`](classes/Client.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Base` | [`ConfigClass`](interfaces/ConfigClass.md)\<`TTable`, `TUniqueKey`, `TClient`\> |

#### Returns

[`PrimitiveClass`](modules.md#primitiveclass)\<`TTable`, `TUniqueKey`, `TClient`\>

#### Defined in

[src/ent/mixins/PrimitiveMixin.ts:196](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L196)

___

### evaluate

▸ **evaluate**\<`TInput`\>(`vc`, `input`, `rules`, `fashion`): `Promise`\<\{ `allow`: `boolean` ; `results`: [`RuleResult`](interfaces/RuleResult.md)[] ; `cause`: `string`  }\>

This is a hearth of permissions checking, a machine which evaluates the rules
chain from top to bottom (one after another) and makes the decision based on
the following logic:
- ALLOW immediately allows the chain, the rest of the rules are not checked.
  It's an eager allowance.
- DENY immediately denies the chain, the rest of the rules are not checked.
  It's an eager denial.
- TOLERATE delegates the decision to the next rules; if it's the last
  decision in the chain, then allows the chain. I.e. it's like an allowance,
  but only if everyone else is tolerant.
- SKIP also delegates the decision to the next rules, but if it's the last
  rule in the chain (i.e. nothing to skip to anymore), denies the chain. I.e.
  it's "I don't vote here, please ask others".
- An empty chain is always denied.

Having TOLERATE decision may sound superfluous, but unfortunately it's not.
The TOLERATE enables usage of the same machinery for both read-like checks
(where we typically want ANY of the rules to be okay with the row) and for
write-like checks (where we typically want ALL rules to be okay with the
row). Having the same logic for everything simplifies the code.

If parallel argument is true, all the rules are run at once in concurrent
promises before the machine starts. This doesn't affect the final result,
just speeds up processing if we know that there is a high chance that most of
the rules will likely return TOLERATE and we'll anyway need to evaluate all
of them (e.g. most of the rules are Require, like in write operations). As
opposed, for read operation, there is a high chance for the first rule (which
is often AllowIf) to succeed, so we evaluate the rules sequentially, not in
parallel (to minimize the number of DB queries).

Example of a chain (the order of rules always matters!):
- new Require(new OutgoingEdgePointsToVC("user_id"))
- new Require(new CanReadOutgoingEdge("post_id", EntPost))

Example of a chain:
- new AllowIf(new OutgoingEdgePointsToVC("user_id"))
- new AllowIf(new CanReadOutgoingEdge("post_id", EntPost))

Example of a chain:
- new DenyIf(new UserIsPendingApproval())
- new AllowIf(new OutgoingEdgePointsToVC("user_id"))

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TInput` | extends `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `input` | `TInput` |
| `rules` | [`Rule`](classes/Rule.md)\<`TInput`\>[] |
| `fashion` | ``"parallel"`` \| ``"sequential"`` |

#### Returns

`Promise`\<\{ `allow`: `boolean` ; `results`: [`RuleResult`](interfaces/RuleResult.md)[] ; `cause`: `string`  }\>

#### Defined in

[src/ent/rules/evaluate.ts:50](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/evaluate.ts#L50)

___

### isBigintStr

▸ **isBigintStr**(`str`): `boolean`

It's hard to support PG bigint type in JS, so people use strings instead.
THis function checks that a string can be passed to PG as a bigint.

#### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `string` |

#### Returns

`boolean`

#### Defined in

[src/helpers/isBigintStr.ts:8](https://github.com/clickup/ent-framework/blob/master/src/helpers/isBigintStr.ts#L8)

___

### default

▸ **default**(): `AsyncGenerator`\<`unknown`\>

#### Returns

`AsyncGenerator`\<`unknown`\>

#### Defined in

[src/pg/__benchmarks__/batched-inserts.benchmark.ts:29](https://github.com/clickup/ent-framework/blob/master/src/pg/__benchmarks__/batched-inserts.benchmark.ts#L29)

___

### buildShape

▸ **buildShape**(`sql`): `string`

Extracts a "shape" from some commonly built SQL queries. This function may be
used from the outside for logging/debugging, so it's here, not in __tests__.

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

`string`

#### Defined in

[src/pg/helpers/buildShape.ts:52](https://github.com/clickup/ent-framework/blob/master/src/pg/helpers/buildShape.ts#L52)

___

### escapeIdent

▸ **escapeIdent**(`ident`): `string`

Optionally encloses a PG identifier (like table name) in "".

#### Parameters

| Name | Type |
| :------ | :------ |
| `ident` | `string` |

#### Returns

`string`

#### Defined in

[src/pg/helpers/escapeIdent.ts:4](https://github.com/clickup/ent-framework/blob/master/src/pg/helpers/escapeIdent.ts#L4)

___

### escapeLiteral

▸ **escapeLiteral**(`literal`): `string`

Builds a part of SQL query using ?-placeholders to prevent SQL Injection.
Everywhere where we want to accept a piece of SQL, we should instead accept a
Literal tuple.

The function converts a Literal tuple [fmt, ...args] into a string, escaping
the args and interpolating them into the format SQL where "?" is a
placeholder for the replacing value.

#### Parameters

| Name | Type |
| :------ | :------ |
| `literal` | [`Literal`](modules.md#literal) |

#### Returns

`string`

#### Defined in

[src/pg/helpers/escapeLiteral.ts:15](https://github.com/clickup/ent-framework/blob/master/src/pg/helpers/escapeLiteral.ts#L15)
