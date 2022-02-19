[@slapdash/ent-framework](README.md) / Exports

# @slapdash/ent-framework

## Enumerations

- [RuleDecision](enums/RuleDecision.md)

## Classes

- [AllowIf](classes/AllowIf.md)
- [Batcher](classes/Batcher.md)
- [CanReadOutgoingEdge](classes/CanReadOutgoingEdge.md)
- [CanUpdateOutgoingEdge](classes/CanUpdateOutgoingEdge.md)
- [Client](classes/Client.md)
- [Cluster](classes/Cluster.md)
- [Configuration](classes/Configuration.md)
- [DenyIf](classes/DenyIf.md)
- [EntAccessError](classes/EntAccessError.md)
- [EntCannotDetectShardError](classes/EntCannotDetectShardError.md)
- [EntNotFoundError](classes/EntNotFoundError.md)
- [EntNotInsertableError](classes/EntNotInsertableError.md)
- [EntNotReadableError](classes/EntNotReadableError.md)
- [EntNotUpdatableError](classes/EntNotUpdatableError.md)
- [EntTestComment](classes/EntTestComment.md)
- [EntTestCompany](classes/EntTestCompany.md)
- [EntTestCountry](classes/EntTestCountry.md)
- [EntTestHeadline](classes/EntTestHeadline.md)
- [EntTestPost](classes/EntTestPost.md)
- [EntTestUser](classes/EntTestUser.md)
- [EntUniqueKeyError](classes/EntUniqueKeyError.md)
- [EntValidationError](classes/EntValidationError.md)
- [FieldIs](classes/FieldIs.md)
- [FuncToPredicate](classes/FuncToPredicate.md)
- [IDsCache](classes/IDsCache.md)
- [IDsCacheCanReadIncomingEdge](classes/IDsCacheCanReadIncomingEdge.md)
- [IDsCacheReadable](classes/IDsCacheReadable.md)
- [IDsCacheUpdatable](classes/IDsCacheUpdatable.md)
- [IncomingEdgeFromVCExists](classes/IncomingEdgeFromVCExists.md)
- [Inverse](classes/Inverse.md)
- [Island](classes/Island.md)
- [Loader](classes/Loader.md)
- [OutgoingEdgePointsToVC](classes/OutgoingEdgePointsToVC.md)
- [QueryBase](classes/QueryBase.md)
- [QueryCache](classes/QueryCache.md)
- [Require](classes/Require.md)
- [Rule](classes/Rule.md)
- [Runner](classes/Runner.md)
- [SQLClientPool](classes/SQLClientPool.md)
- [SQLError](classes/SQLError.md)
- [SQLQueryCount](classes/SQLQueryCount.md)
- [SQLQueryDelete](classes/SQLQueryDelete.md)
- [SQLQueryDeleteWhere](classes/SQLQueryDeleteWhere.md)
- [SQLQueryIDGen](classes/SQLQueryIDGen.md)
- [SQLQueryInsert](classes/SQLQueryInsert.md)
- [SQLQueryLoad](classes/SQLQueryLoad.md)
- [SQLQueryLoadBy](classes/SQLQueryLoadBy.md)
- [SQLQuerySelect](classes/SQLQuerySelect.md)
- [SQLQueryUpdate](classes/SQLQueryUpdate.md)
- [SQLQueryUpsert](classes/SQLQueryUpsert.md)
- [SQLRunner](classes/SQLRunner.md)
- [SQLRunnerCount](classes/SQLRunnerCount.md)
- [SQLRunnerDelete](classes/SQLRunnerDelete.md)
- [SQLRunnerDeleteWhere](classes/SQLRunnerDeleteWhere.md)
- [SQLRunnerIDGen](classes/SQLRunnerIDGen.md)
- [SQLRunnerInsert](classes/SQLRunnerInsert.md)
- [SQLRunnerLoad](classes/SQLRunnerLoad.md)
- [SQLRunnerLoadBy](classes/SQLRunnerLoadBy.md)
- [SQLRunnerSelect](classes/SQLRunnerSelect.md)
- [SQLRunnerUpdate](classes/SQLRunnerUpdate.md)
- [SQLRunnerUpsert](classes/SQLRunnerUpsert.md)
- [SQLSchema](classes/SQLSchema.md)
- [Schema](classes/Schema.md)
- [Shard](classes/Shard.md)
- [ShardLocator](classes/ShardLocator.md)
- [TestSQLClient](classes/TestSQLClient.md)
- [Timeline](classes/Timeline.md)
- [TimelineManager](classes/TimelineManager.md)
- [Triggers](classes/Triggers.md)
- [True](classes/True.md)
- [VC](classes/VC.md)
- [VCFlavor](classes/VCFlavor.md)
- [VCHasFlavor](classes/VCHasFlavor.md)
- [VCTrace](classes/VCTrace.md)
- [VCWithQueryCache](classes/VCWithQueryCache.md)
- [VCWithStacks](classes/VCWithStacks.md)
- [Validation](classes/Validation.md)
- [ValidationTester](classes/ValidationTester.md)

## Interfaces

- [ClientQueryLoggerProps](interfaces/ClientQueryLoggerProps.md)
- [ConfigClass](interfaces/ConfigClass.md)
- [ConfigInstance](interfaces/ConfigInstance.md)
- [Ent](interfaces/Ent.md)
- [EntClass](interfaces/EntClass.md)
- [EntInputLoggerProps](interfaces/EntInputLoggerProps.md)
- [EntValidationErrorInfo](interfaces/EntValidationErrorInfo.md)
- [Handler](interfaces/Handler.md)
- [HelpersClass](interfaces/HelpersClass.md)
- [HelpersInstance](interfaces/HelpersInstance.md)
- [Loggers](interfaces/Loggers.md)
- [Predicate](interfaces/Predicate.md)
- [PrimitiveInstance](interfaces/PrimitiveInstance.md)
- [Query](interfaces/Query.md)
- [QueryAnnotation](interfaces/QueryAnnotation.md)
- [RuleResult](interfaces/RuleResult.md)
- [SQLClient](interfaces/SQLClient.md)
- [SQLClientDest](interfaces/SQLClientDest.md)
- [SchemaClass](interfaces/SchemaClass.md)

## Type aliases

### AddNew

Ƭ **AddNew**<`TClass`, `TRet`\>: [`OmitNew`](modules.md#omitnew)<`TClass`\> & {}

Adds a type alternative to constructor signature's return value. This is
useful when we e.g. turn an instance of some Ent class into an Instance & Row
type where Row is dynamically inferred from the schema.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClass` | extends (...`args`: `any`[]) => `any` |
| `TRet` | `TRet` |

#### Defined in

[packages/ent-framework/src/helpers.ts:14](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L14)

___

### AfterMutationTrigger

Ƭ **AfterMutationTrigger**<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: { `newOrOldRow`: [`Flatten`](modules.md#flatten)<[`InsertInputPartialSymbols`](modules.md#insertinputpartialsymbols)<`TTable`\> & [`RowWithID`](modules.md#rowwithid)\> ; `op`: ``"INSERT"`` \| ``"UPDATE"`` \| ``"DELETE"``  }) => `Promise`<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | `Object` |
| `args.newOrOldRow` | [`Flatten`](modules.md#flatten)<[`InsertInputPartialSymbols`](modules.md#insertinputpartialsymbols)<`TTable`\> & [`RowWithID`](modules.md#rowwithid)\> |
| `args.op` | ``"INSERT"`` \| ``"UPDATE"`` \| ``"DELETE"`` |

##### Returns

`Promise`<`unknown`\>

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:86](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L86)

___

### AfterUpdateTrigger

Ƭ **AfterUpdateTrigger**<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: { `newRow`: [`Flatten`](modules.md#flatten)<`Readonly`<[`TriggerRow`](modules.md#triggerrow)<`TTable`\>\>\> ; `oldRow`: [`Flatten`](modules.md#flatten)<`Readonly`<[`TriggerRow`](modules.md#triggerrow)<`TTable`\>\>\>  }) => `Promise`<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | `Object` |
| `args.newRow` | [`Flatten`](modules.md#flatten)<`Readonly`<[`TriggerRow`](modules.md#triggerrow)<`TTable`\>\>\> |
| `args.oldRow` | [`Flatten`](modules.md#flatten)<`Readonly`<[`TriggerRow`](modules.md#triggerrow)<`TTable`\>\>\> |

##### Returns

`Promise`<`unknown`\>

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:71](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L71)

___

### AnyClass

Ƭ **AnyClass**: (...`args`: `any`) => `any`

#### Type declaration

• (...`args`)

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any` |

#### Defined in

[packages/ent-framework/src/ent/QueryCache.ts:8](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/QueryCache.ts#L8)

___

### BeforeUpdateTrigger

Ƭ **BeforeUpdateTrigger**<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: { `input`: [`Flatten`](modules.md#flatten)<[`UpdateInput`](modules.md#updateinput)<`TTable`\>\> ; `newRow`: [`Flatten`](modules.md#flatten)<`Readonly`<[`TriggerRow`](modules.md#triggerrow)<`TTable`\>\>\> ; `oldRow`: [`Flatten`](modules.md#flatten)<`Readonly`<[`TriggerRow`](modules.md#triggerrow)<`TTable`\>\>\>  }) => `Promise`<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | `Object` |
| `args.input` | [`Flatten`](modules.md#flatten)<[`UpdateInput`](modules.md#updateinput)<`TTable`\>\> |
| `args.newRow` | [`Flatten`](modules.md#flatten)<`Readonly`<[`TriggerRow`](modules.md#triggerrow)<`TTable`\>\>\> |
| `args.oldRow` | [`Flatten`](modules.md#flatten)<`Readonly`<[`TriggerRow`](modules.md#triggerrow)<`TTable`\>\>\> |

##### Returns

`Promise`<`unknown`\>

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:62](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L62)

___

### CountInput

Ƭ **CountInput**<`TTable`\>: [`Where`](modules.md#where)<`TTable`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:231](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L231)

___

### DeleteTrigger

Ƭ **DeleteTrigger**<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: { `oldRow`: [`Flatten`](modules.md#flatten)<`Readonly`<[`Row`](modules.md#row)<`TTable`\>\>\>  }) => `Promise`<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`<`unknown`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | `Object` |
| `args.oldRow` | [`Flatten`](modules.md#flatten)<`Readonly`<[`Row`](modules.md#row)<`TTable`\>\>\> |

##### Returns

`Promise`<`unknown`\>

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:79](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L79)

___

### DeleteWhereInput

Ƭ **DeleteWhereInput**<`TTable`\>: { `id`: `string`[]  } & `Omit`<[`Where`](modules.md#where)<`TTable`\>, typeof [`ID`](modules.md#id)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:234](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L234)

___

### DepsBuilder

Ƭ **DepsBuilder**<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `row`: [`Flatten`](modules.md#flatten)<`Readonly`<[`InsertInputPartialSymbols`](modules.md#insertinputpartialsymbols)<`TTable`\> & [`RowWithID`](modules.md#rowwithid)\>\>) => `string` \| `Promise`<`string`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `row`): `string` \| `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `row` | [`Flatten`](modules.md#flatten)<`Readonly`<[`InsertInputPartialSymbols`](modules.md#insertinputpartialsymbols)<`TTable`\> & [`RowWithID`](modules.md#rowwithid)\>\> |

##### Returns

`string` \| `Promise`<`string`\>

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:96](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L96)

___

### Flatten

Ƭ **Flatten**<`T`\>: {} & { [P in keyof T]: T[P] }

Flattens the interface to make it more readable in IntelliSense. Can be used
when someone modifies (picks, omits, etc.) a huge type.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[packages/ent-framework/src/helpers.ts:23](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L23)

___

### IDFields

Ƭ **IDFields**<`TTable`\>: { [K in keyof TTable]: K extends string ? TTable[K] extends Object ? K : never : never }[keyof `TTable`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:169](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L169)

___

### IDFieldsRequired

Ƭ **IDFieldsRequired**<`TTable`\>: [`InsertFieldsRequired`](modules.md#insertfieldsrequired)<`TTable`\> & [`IDFields`](modules.md#idfields)<`TTable`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:178](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L178)

___

### InsertFieldsOptional

Ƭ **InsertFieldsOptional**<`TTable`\>: { [K in keyof TTable]: TTable[K] extends Object ? K : TTable[K] extends Object ? K : never }[keyof `TTable`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:99](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L99)

___

### InsertFieldsRequired

Ƭ **InsertFieldsRequired**<`TTable`\>: { [K in keyof TTable]: TTable[K] extends Object ? never : TTable[K] extends Object ? never : K }[keyof `TTable`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:90](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L90)

___

### InsertInput

Ƭ **InsertInput**<`TTable`\>: { [K in InsertFieldsRequired<TTable\>]: Value<TTable[K]\> } & { [K in InsertFieldsOptional<TTable\>]?: Value<TTable[K]\> }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:109](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L109)

___

### InsertInputPartialSymbols

Ƭ **InsertInputPartialSymbols**<`TTable`\>: { [K in InsertFieldsRequired<TTable\>]: Value<TTable[K]\> \| (K extends symbol ? undefined : never) } & { [K in InsertFieldsOptional<TTable\>]?: Value<TTable[K]\> }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:116](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L116)

___

### InsertTrigger

Ƭ **InsertTrigger**<`TTable`\>: (`vc`: [`VC`](classes/VC.md), `args`: { `input`: [`Flatten`](modules.md#flatten)<[`InsertInput`](modules.md#insertinput)<`TTable`\> & [`RowWithID`](modules.md#rowwithid)\>  }) => `Promise`<`unknown`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

▸ (`vc`, `args`): `Promise`<`unknown`\>

Triggers could be used to simulate "transactional best-effort behavior" in a
non-transactional combination of some services. Imagine we have an SQL
database and a queue service; each time we change something in SQL, we want
to schedule the ID to the queue. Queue service is faulty: if a queueing
operation fails, we don't want the data to be stored to SQL DB afterwards.
SQL operations are faulty too, but it's okay for us to have something added
to the queue even if the corresponding SQL operation failed after it (a queue
worker will just do a no-op since it anyway rechecks the source of truth in
SQL DB). Queue service is like a write-ahead log for SQL DB which always has
not-less records than SQL DB. In this case, we have the following set of
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

##### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](classes/VC.md) |
| `args` | `Object` |
| `args.input` | [`Flatten`](modules.md#flatten)<[`InsertInput`](modules.md#insertinput)<`TTable`\> & [`RowWithID`](modules.md#rowwithid)\> |

##### Returns

`Promise`<`unknown`\>

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:51](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L51)

___

### Literal

Ƭ **Literal**: `ReadonlyArray`<`string` \| `number` \| `Date` \| ``null``\>

#### Defined in

[packages/ent-framework/src/types.ts:20](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L20)

___

### LoadByInput

Ƭ **LoadByInput**<`TTable`, `TUniqueKey`\>: `TUniqueKey` extends `never`[] ? `never` : { [K in UniqueKeyFields<TTable, TUniqueKey\>]: Value<TTable[K]\> }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)<`TTable`\> |

#### Defined in

[packages/ent-framework/src/types.ts:161](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L161)

___

### OmitNew

Ƭ **OmitNew**<`T`\>: `Pick`<`T`, keyof `T`\>

Removes constructor signature from a type.
https://github.com/microsoft/TypeScript/issues/40110#issuecomment-747142570

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends (...`args`: `any`[]) => `any` |

#### Defined in

[packages/ent-framework/src/helpers.ts:7](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L7)

___

### Order

Ƭ **Order**<`TTable`\>: `ReadonlyArray`<{ [K in keyof TTable]?: string } & { `$literal?`: [`Literal`](modules.md#literal)  }\>

#### Type parameters

| Name |
| :------ |
| `TTable` |

#### Defined in

[packages/ent-framework/src/types.ts:216](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L216)

___

### PrimitiveClass

Ƭ **PrimitiveClass**<`TTable`, `TUniqueKey`, `TClient`\>: [`OmitNew`](modules.md#omitnew)<[`ConfigClass`](interfaces/ConfigClass.md)<`TTable`, `TUniqueKey`, `TClient`\>\> & { `count`: (`vc`: [`VC`](classes/VC.md), `where`: [`CountInput`](modules.md#countinput)<`TTable`\>) => `Promise`<`number`\> ; `insertIfNotExists`: (`vc`: [`VC`](classes/VC.md), `input`: [`InsertInput`](modules.md#insertinput)<`TTable`\>) => `Promise`<``null`` \| `string`\> ; `loadByNullable`: <TEnt\>(`vc`: [`VC`](classes/VC.md), `input`: [`LoadByInput`](modules.md#loadbyinput)<`TTable`, `TUniqueKey`\>) => `Promise`<``null`` \| `TEnt`\> ; `loadNullable`: <TEnt\>(`vc`: [`VC`](classes/VC.md), `id`: `string`) => `Promise`<``null`` \| `TEnt`\> ; `select`: <TEnt\>(`vc`: [`VC`](classes/VC.md), `where`: [`Where`](modules.md#where)<`TTable`\>, `limit`: `number`, `order?`: [`Order`](modules.md#order)<`TTable`\>, `custom?`: {}) => `Promise`<`TEnt`[]\> ; `selectChunked`: <TEnt\>(`vc`: [`VC`](classes/VC.md), `where`: [`Where`](modules.md#where)<`TTable`\>, `chunkSize`: `number`, `limit`: `number`, `custom?`: {}) => `AsyncIterableIterator`<`TEnt`[]\> ; `upsert`: (`vc`: [`VC`](classes/VC.md), `input`: [`InsertInput`](modules.md#insertinput)<`TTable`\>) => `Promise`<`string`\>  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)<`TTable`\> |
| `TClient` | extends [`Client`](classes/Client.md) |

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:51](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L51)

___

### Row

Ƭ **Row**<`TTable`\>: [`RowWithID`](modules.md#rowwithid) & { [K in keyof TTable]: K extends symbol ? never : Value<TTable[K]\> }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:78](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L78)

___

### RowWithID

Ƭ **RowWithID**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Defined in

[packages/ent-framework/src/types.ts:30](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L30)

___

### SelectInput

Ƭ **SelectInput**<`TTable`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `custom?` | {} |
| `limit` | `number` |
| `order?` | [`Order`](modules.md#order)<`TTable`\> |
| `where` | [`Where`](modules.md#where)<`TTable`\> |

#### Defined in

[packages/ent-framework/src/types.ts:223](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L223)

___

### ShardAffinity

Ƭ **ShardAffinity**<`TField`\>: readonly `TField`[] \| typeof [`RANDOM_SHARD`](modules.md#random_shard) \| typeof [`GLOBAL_SHARD`](modules.md#global_shard)

Defines Ent shard collocation to some Ent's field when this Ent is inserted.
The shard can either be picked randomly, be always shard 0 or be inferred
based on the value in other Ent fields during the insertion.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:32](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L32)

___

### Spec

Ƭ **Spec**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `allowNull?` | ``true`` |
| `autoInsert?` | `string` |
| `autoUpdate?` | `string` |
| `type` | [`SpecType`](modules.md#spectype) |

#### Defined in

[packages/ent-framework/src/types.ts:43](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L43)

___

### SpecType

Ƭ **SpecType**: typeof `Number` \| typeof `String` \| typeof `Boolean` \| typeof [`ID`](modules.md#id) \| typeof `Date` \| { `parse`: (`dbValue`: `any`) => `any` ; `stringify`: (`jsValue`: `any`) => `string`  }

#### Defined in

[packages/ent-framework/src/types.ts:34](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L34)

___

### Table

Ƭ **Table**: `Object`

#### Index signature

▪ [K: `string` \| `symbol`]: [`Spec`](modules.md#spec)

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | [`Spec`](modules.md#spec) |

#### Defined in

[packages/ent-framework/src/types.ts:51](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L51)

___

### TimelineCaughtUpReason

Ƭ **TimelineCaughtUpReason**: ``false`` \| ``"replica-bc-master-state-unknown"`` \| ``"replica-bc-caught-up"`` \| ``"replica-bc-pos-expired"``

The reason why the decision that this replica timeline is "good enough" has
been made.

#### Defined in

[packages/ent-framework/src/abstract/Timeline.ts:7](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Timeline.ts#L7)

___

### TriggerRow

Ƭ **TriggerRow**<`TTable`\>: [`RowWithID`](modules.md#rowwithid) & { [K in keyof TTable]: K extends symbol ? Value<TTable[K]\> \| undefined : Value<TTable[K]\> }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:83](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L83)

___

### UniqueKey

Ƭ **UniqueKey**<`TTable`\>: `ReadonlyArray`<{ [K in keyof TTable]: TTable[K] extends Object ? K : never }[keyof `TTable`]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:140](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L140)

___

### UniqueKeyFields

Ƭ **UniqueKeyFields**<`TConcreteTable`, `TConcreteUniqueKey`\>: `TConcreteUniqueKey`[`number`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TConcreteTable` | extends [`Table`](modules.md#table) |
| `TConcreteUniqueKey` | extends [`UniqueKey`](modules.md#uniquekey)<`TConcreteTable`\> |

#### Defined in

[packages/ent-framework/src/types.ts:154](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L154)

___

### UpdateFields

Ƭ **UpdateFields**<`TTable`\>: `Exclude`<keyof `TTable`, keyof [`RowWithID`](modules.md#rowwithid)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:125](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L125)

___

### UpdateInput

Ƭ **UpdateInput**<`TTable`\>: { [K in UpdateFields<TTable\>]?: Value<TTable[K]\> } & { `$literal?`: [`Literal`](modules.md#literal)  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:132](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L132)

___

### ValidationRules

Ƭ **ValidationRules**<`TTable`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `delete?` | [`Validation`](classes/Validation.md)<`TTable`\>[``"delete"``] |
| `insert` | [`Validation`](classes/Validation.md)<`TTable`\>[``"insert"``] |
| `load` | [`Validation`](classes/Validation.md)<`TTable`\>[``"load"``] |
| `tenantUserIDField?` | [`InsertFieldsRequired`](modules.md#insertfieldsrequired)<`TTable`\> |
| `update?` | [`Validation`](classes/Validation.md)<`TTable`\>[``"update"``] |
| `validate?` | [`Predicate`](interfaces/Predicate.md)<[`Row`](modules.md#row)<`TTable`\>\> & [`EntValidationErrorInfo`](interfaces/EntValidationErrorInfo.md)[] |

#### Defined in

[packages/ent-framework/src/ent/Validation.ts:22](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Validation.ts#L22)

___

### Value

Ƭ **Value**<`TSpec`\>: `TSpec` extends { `allowNull`: ``true``  } ? [`ValueRequired`](modules.md#valuerequired)<`TSpec`\> \| ``null`` : [`ValueRequired`](modules.md#valuerequired)<`TSpec`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TSpec` | extends [`Spec`](modules.md#spec) |

#### Defined in

[packages/ent-framework/src/types.ts:73](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L73)

___

### ValueRequired

Ƭ **ValueRequired**<`TSpec`\>: `TSpec`[``"type"``] extends typeof `Number` ? `number` : `TSpec`[``"type"``] extends typeof `String` ? `string` : `TSpec`[``"type"``] extends typeof `Boolean` ? `boolean` : `TSpec`[``"type"``] extends typeof [`ID`](modules.md#id) ? `string` : `TSpec`[``"type"``] extends typeof `Date` ? `Date` : `TSpec`[``"type"``] extends { `parse`: (`dbValue`: `any`) => `TJSValue`  } ? `TJSValue` : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TSpec` | extends [`Spec`](modules.md#spec) |

#### Defined in

[packages/ent-framework/src/types.ts:57](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L57)

___

### Where

Ƭ **Where**<`TTable`\>: { `$not?`: [`WhereWithoutNot`](modules.md#wherewithoutnot)<`TTable`\>  } & [`WhereWithoutNot`](modules.md#wherewithoutnot)<`TTable`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:202](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L202)

___

### WhereWithoutNot

Ƭ **WhereWithoutNot**<`TTable`\>: { `$and?`: `ReadonlyArray`<[`Where`](modules.md#where)<`TTable`\>\> ; `$literal?`: [`Literal`](modules.md#literal) ; `$or?`: `ReadonlyArray`<[`Where`](modules.md#where)<`TTable`\>\>  } & { [K in keyof TTable]?: K extends symbol ? never : Value<TTable[K]\> \| ReadonlyArray<Value<TTable[K]\>\> \| Object \| Object \| Object \| Object \| Object \| Object }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Defined in

[packages/ent-framework/src/types.ts:182](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L182)

___

### WhyClient

Ƭ **WhyClient**: `Exclude`<[`TimelineCaughtUpReason`](modules.md#timelinecaughtupreason), ``false``\> \| ``"replica-bc-stale-replica-freshness"`` \| ``"master-bc-is-write"`` \| ``"master-bc-master-freshness"`` \| ``"master-bc-no-replicas"`` \| ``"master-bc-replica-not-caught-up"``

A reason why master or replica was chosen to send the query too. The most
noticeable ones are:
- "replica-bc-master-state-unknown": 99% of cases (since writes are rare)
- "master-bc-replica-not-caught-up": happens immediately after each write,
  until the write is propagated to replica
- "replica-bc-caught-up": must happen eventually (in 0.1-2s) after each write
- "replica-bc-pos-expired": signals that the replication lag is huge, we
  should carefully monitor this case and make sure it never happens

#### Defined in

[packages/ent-framework/src/abstract/QueryAnnotation.ts:13](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/QueryAnnotation.ts#L13)

## Variables

### $EPHEMERAL

• **$EPHEMERAL**: typeof [`$EPHEMERAL`](modules.md#$ephemeral)

#### Defined in

[packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts:158](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts#L158)

___

### $EPHEMERAL2

• **$EPHEMERAL2**: typeof [`$EPHEMERAL2`](modules.md#$ephemeral2)

#### Defined in

[packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts:159](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts#L159)

___

### $and

• **$and**: ``"$and"``

#### Defined in

[packages/ent-framework/src/types.ts:8](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L8)

___

### $gt

• **$gt**: ``"$>"``

#### Defined in

[packages/ent-framework/src/types.ts:14](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L14)

___

### $gte

• **$gte**: ``"$>="``

#### Defined in

[packages/ent-framework/src/types.ts:13](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L13)

___

### $literal

• **$literal**: ``"$literal"``

#### Defined in

[packages/ent-framework/src/types.ts:17](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L17)

___

### $lt

• **$lt**: ``"$<"``

#### Defined in

[packages/ent-framework/src/types.ts:12](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L12)

___

### $lte

• **$lte**: ``"$<="``

#### Defined in

[packages/ent-framework/src/types.ts:11](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L11)

___

### $ne

• **$ne**: ``"$!="``

#### Defined in

[packages/ent-framework/src/types.ts:15](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L15)

___

### $not

• **$not**: ``"$not"``

#### Defined in

[packages/ent-framework/src/types.ts:10](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L10)

___

### $or

• **$or**: ``"$or"``

#### Defined in

[packages/ent-framework/src/types.ts:9](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L9)

___

### $overlap

• **$overlap**: ``"$overlap"``

#### Defined in

[packages/ent-framework/src/types.ts:16](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L16)

___

### DEFAULT\_MAX\_BATCH\_SIZE

• **DEFAULT\_MAX\_BATCH\_SIZE**: ``100``

#### Defined in

[packages/ent-framework/src/abstract/Batcher.ts:6](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Batcher.ts#L6)

___

### GLOBAL\_SHARD

• **GLOBAL\_SHARD**: ``"global_shard"``

The table is located in the global shard (shard 0).

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:20](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L20)

___

### ID

• **ID**: ``"id"``

#### Defined in

[packages/ent-framework/src/types.ts:2](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/types.ts#L2)

___

### MASTER

• **MASTER**: typeof [`MASTER`](modules.md#master)

Master freshness: reads always go to master.

#### Defined in

[packages/ent-framework/src/abstract/Shard.ts:11](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Shard.ts#L11)

___

### RANDOM\_SHARD

• **RANDOM\_SHARD**: ``"random_shard"``

The record is put in a random shard's table when inserted.

#### Defined in

[packages/ent-framework/src/ent/Configuration.ts:25](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Configuration.ts#L25)

___

### STALE\_REPLICA

• **STALE\_REPLICA**: typeof [`STALE_REPLICA`](modules.md#stale_replica)

Stale replica freshness: reads always go to a replica, even if it's stale.

#### Defined in

[packages/ent-framework/src/abstract/Shard.ts:16](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Shard.ts#L16)

___

### testCluster

• **testCluster**: [`Cluster`](classes/Cluster.md)<[`TestSQLClient`](classes/TestSQLClient.md)\>

#### Defined in

[packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts:125](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/__tests__/helpers/TestSQLClient.ts#L125)

___

### vcTestGuest

• **vcTestGuest**: [`VC`](classes/VC.md)

#### Defined in

[packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts:25](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts#L25)

## Functions

### BaseEnt

▸ **BaseEnt**<`TTable`, `TUniqueKey`, `TClient`\>(`cluster`, `schema`): [`HelpersClass`](interfaces/HelpersClass.md)<`TTable`, `TUniqueKey`, `TClient`\>

This is a helper function to create new Ent classes. Run once per each
Ent+cluster on app boot. See examples in __tests__/TestObjects.ts and
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
| `TUniqueKey` | extends readonly { [K in string \| number \| symbol]: TTable[K] extends Object ? K : never }[keyof `TTable`][] |
| `TClient` | extends [`Client`](classes/Client.md)<`TClient`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `cluster` | [`Cluster`](classes/Cluster.md)<`TClient`\> |
| `schema` | [`Schema`](classes/Schema.md)<`TTable`, `TUniqueKey`\> |

#### Returns

[`HelpersClass`](interfaces/HelpersClass.md)<`TTable`, `TUniqueKey`, `TClient`\>

#### Defined in

[packages/ent-framework/src/ent/BaseEnt.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/BaseEnt.ts#L31)

___

### CacheMixin

▸ **CacheMixin**<`TTable`, `TUniqueKey`, `TClient`\>(`Base`): [`PrimitiveClass`](modules.md#primitiveclass)<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding VC-stored cache layer to it.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends readonly { [K in string \| number \| symbol]: TTable[K] extends Object ? K : never }[keyof `TTable`][] |
| `TClient` | extends [`Client`](classes/Client.md)<`TClient`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Base` | [`PrimitiveClass`](modules.md#primitiveclass)<`TTable`, `TUniqueKey`, `TClient`\> |

#### Returns

[`PrimitiveClass`](modules.md#primitiveclass)<`TTable`, `TUniqueKey`, `TClient`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/CacheMixin.ts:19](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/CacheMixin.ts#L19)

___

### ConfigMixin

▸ **ConfigMixin**<`TTable`, `TUniqueKey`, `TClient`\>(`Base`, `cluster`, `schema`): [`ConfigClass`](interfaces/ConfigClass.md)<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding support for Ent configuration (such as:
cluster, table schema, privacy rules, triggers etc.).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends readonly { [K in string \| number \| symbol]: TTable[K] extends Object ? K : never }[keyof `TTable`][] |
| `TClient` | extends [`Client`](classes/Client.md)<`TClient`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Base` | (...`args`: `any`[]) => {} |
| `cluster` | [`Cluster`](classes/Cluster.md)<`TClient`\> |
| `schema` | [`Schema`](classes/Schema.md)<`TTable`, `TUniqueKey`\> |

#### Returns

[`ConfigClass`](interfaces/ConfigClass.md)<`TTable`, `TUniqueKey`, `TClient`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/ConfigMixin.ts:84](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/ConfigMixin.ts#L84)

___

### HelpersMixin

▸ **HelpersMixin**<`TTable`, `TUniqueKey`, `TClient`\>(`Base`): [`HelpersClass`](interfaces/HelpersClass.md)<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding convenience methods (like loadX() which
throws when an Ent can't be loaded instead of returning null as it's done in
the primitive operations).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends readonly { [K in string \| number \| symbol]: TTable[K] extends Object ? K : never }[keyof `TTable`][] |
| `TClient` | extends [`Client`](classes/Client.md)<`TClient`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Base` | [`PrimitiveClass`](modules.md#primitiveclass)<`TTable`, `TUniqueKey`, `TClient`\> |

#### Returns

[`HelpersClass`](interfaces/HelpersClass.md)<`TTable`, `TUniqueKey`, `TClient`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/HelpersMixin.ts:117](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/HelpersMixin.ts#L117)

___

### Memoize

▸ **Memoize**(`hashFunction?`): (`_target`: `Object`, `_propertyKey`: `string` \| `symbol`, `descriptor`: `TypedPropertyDescriptor`<`any`\>) => `void`

Shamelessly stolen from https://www.npmjs.com/package/typescript-memoize
The only difference is that, if used to memoize async functions, it clears
the memoize cache if the promise got rejected (i.e. it doesn't memoize
exceptions in async functions).

#### Parameters

| Name | Type |
| :------ | :------ |
| `hashFunction?` | (...`args`: `any`[]) => `any` |

#### Returns

`fn`

▸ (`_target`, `_propertyKey`, `descriptor`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `_target` | `Object` |
| `_propertyKey` | `string` \| `symbol` |
| `descriptor` | `TypedPropertyDescriptor`<`any`\> |

##### Returns

`void`

#### Defined in

[packages/ent-framework/src/Memoize.ts:7](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/Memoize.ts#L7)

___

### PrimitiveMixin

▸ **PrimitiveMixin**<`TTable`, `TUniqueKey`, `TClient`\>(`Base`): [`PrimitiveClass`](modules.md#primitiveclass)<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding support for the minimal number of basic Ent
operations. Internally, uses Schema abstractions to run them.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |
| `TUniqueKey` | extends readonly { [K in string \| number \| symbol]: TTable[K] extends Object ? K : never }[keyof `TTable`][] |
| `TClient` | extends [`Client`](classes/Client.md)<`TClient`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Base` | [`ConfigClass`](interfaces/ConfigClass.md)<`TTable`, `TUniqueKey`, `TClient`\> |

#### Returns

[`PrimitiveClass`](modules.md#primitiveclass)<`TTable`, `TUniqueKey`, `TClient`\>

#### Defined in

[packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts:156](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/mixins/PrimitiveMixin.ts#L156)

___

### buildNewRow

▸ **buildNewRow**<`TTable`\>(`oldRow`, `input`): [`Row`](modules.md#row)<`TTable`\>

Simulates an update for a row, as if it's applied to the Ent.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTable` | extends [`Table`](modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `oldRow` | [`Row`](modules.md#row)<`TTable`\> |
| `input` | [`UpdateInput`](modules.md#updateinput)<`TTable`\> |

#### Returns

[`Row`](modules.md#row)<`TTable`\>

#### Defined in

[packages/ent-framework/src/ent/Triggers.ts:257](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/Triggers.ts#L257)

___

### copyStack

▸ **copyStack**(`toErr`, `fromErr`): `Error`

Copies a stack-trace from fromErr error into toErr object. Useful for
lightweight exceptions wrapping.

#### Parameters

| Name | Type |
| :------ | :------ |
| `toErr` | `Error` |
| `fromErr` | `Error` |

#### Returns

`Error`

#### Defined in

[packages/ent-framework/src/helpers.ts:46](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L46)

___

### createVC

▸ **createVC**(): [`VC`](classes/VC.md)

#### Returns

[`VC`](classes/VC.md)

#### Defined in

[packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts:459](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts#L459)

___

### entries

▸ **entries**<`K`, `V`\>(`obj`): [`K`, `V`][]

Same as Object.entries(), but returns strongly-typed entries.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` |
| `V` | `V` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `Partial`<`Record`<`K`, `V`\>\> |

#### Returns

[`K`, `V`][]

#### Defined in

[packages/ent-framework/src/helpers.ts:283](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L283)

___

### escapeAny

▸ **escapeAny**(`v`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `any` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/sql/SQLClient.ts:20](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClient.ts#L20)

___

### escapeBoolean

▸ **escapeBoolean**(`v`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `undefined` \| ``null`` \| `boolean` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/sql/SQLClient.ts:64](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClient.ts#L64)

___

### escapeDate

▸ **escapeDate**(`v`, `field?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `undefined` \| ``null`` \| `Date` |
| `field?` | `string` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/sql/SQLClient.ts:56](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClient.ts#L56)

___

### escapeID

▸ **escapeID**(`v`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `undefined` \| ``null`` \| `string` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/sql/SQLClient.ts:35](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClient.ts#L35)

___

### escapeIdent

▸ **escapeIdent**(`ident`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ident` | `any` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/sql/SQLClient.ts:14](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClient.ts#L14)

___

### escapeString

▸ **escapeString**(`v`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `undefined` \| ``null`` \| `string` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/sql/SQLClient.ts:48](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClient.ts#L48)

___

### escapeStringify

▸ **escapeStringify**(`v`, `stringify`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `any` |
| `stringify` | (`v`: `any`) => `string` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/sql/SQLClient.ts:68](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClient.ts#L68)

___

### evaluate

▸ **evaluate**<`TInput`\>(`rules`, `vc`, `input`, `parallel`): `Promise`<{ `allow`: `boolean` ; `results`: [`RuleResult`](interfaces/RuleResult.md)[]  }\>

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
- new AllowIf(new VCHasFlavor(VCAdmin))
- new Require(new OutgoingEdgePointsToVC("user_id"))
- new Require(new CanReadOutgoingEdge("post_id", EntPost))

Example of a chain:
- new AllowIf(new OutgoingEdgePointsToVC("user_id"))
- new AllowIf(new CanReadOutgoingEdge("post_id", EntPost))

Example of a chain:
- new AllowIf(new VCHasFlavor(VCAdmin))
- new DenyIf(new UserIsPendingApproval())
- new AllowIf(new OutgoingEdgePointsToVC("user_id"))

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TInput` | extends `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `rules` | [`Rule`](classes/Rule.md)<`TInput`\>[] |
| `vc` | [`VC`](classes/VC.md) |
| `input` | `TInput` |
| `parallel` | `boolean` |

#### Returns

`Promise`<{ `allow`: `boolean` ; `results`: [`RuleResult`](interfaces/RuleResult.md)[]  }\>

#### Defined in

[packages/ent-framework/src/ent/rules/Rule.ts:105](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/rules/Rule.ts#L105)

___

### hasKey

▸ **hasKey**<`K`\>(`k`, `o`): o is { [\_ in string \| symbol]: any }

A typesafe-way to invariant the object's key presence.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `k` | `K` |
| `o` | `any` |

#### Returns

o is { [\_ in string \| symbol]: any }

#### Defined in

[packages/ent-framework/src/helpers.ts:273](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L273)

___

### hash

▸ **hash**(`s`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `string` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/helpers.ts:97](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L97)

___

### indent

▸ **indent**(`message`): `string`

Indents each line of the text with 2 spaces.

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/helpers.ts:106](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L106)

___

### init

▸ **init**(): `Promise`<[[`VC`](classes/VC.md), [`VC`](classes/VC.md)]\>

#### Returns

`Promise`<[[`VC`](classes/VC.md), [`VC`](classes/VC.md)]\>

#### Defined in

[packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts:371](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/__tests__/helpers/test-objects.ts#L371)

___

### isBigintStr

▸ **isBigintStr**(`str`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `string` |

#### Returns

`boolean`

#### Defined in

[packages/ent-framework/src/sql/SQLClient.ts:7](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClient.ts#L7)

___

### join

▸ **join**<`T1`, `T2`, `T3`, `T4`, `T5`, `T6`\>(`values`): `Promise`<[`T1`, `T2`, `T3`, `T4`, `T5`, `T6`]\>

Works the same way as Promise-all, but additionally guarantees that ALL OTHER
promises have settled in case one of them rejects. This is needed to ensure
that we never have unexpected "dangling" promises continuing running in
nowhere in case one of the promises rejects early (the behavior of
Promise.all is to reject eagerly and let the rest of stuff running whilst the
caller code unfreezes).

The behavior of join() is similar to Promise.allSettled(), but it throws the
1st exception occurred; this is what's expected in most of the cases, and
this is how promises are implemented in e.g. Hack.

The benefits of ensuring everything is settled:
1. We never have surprising entries in our logs (e.g. imagine a request
   aborted long time ago, and then some "dangling" promises continue running
   and issue SQL queries as if nothing happened).
2. Predictable control flow: if we run `await join()`, we know that no side
   effects from the spawned promises will appear after this await throws or
   returns.

"Join" is a term from parallel programming (e.g. "join threads"), it’s pretty
concrete and means that after the call, multiple parallel execution flows
“join” into one. It's a word to describe having "one" from "many".

What’s interesting is that, besides Promise-all leaks execution flows, it
still doesn’t trigger UnhandledPromiseRejection for them in case one of them
throws later, it just swallows all other exceptions.

I.e. Promise-all means "run all in parallel, if one throws - throw
immediately and let the others continue running in nowhere; if some of THAT
others throws, swallow their exceptions".

And join() means "run all in parallel, if one throws - wait until everyone
finishes, and then throw the 1st exception; if some of others throw, swallow
their exceptions".

See also https://en.wikipedia.org/wiki/Fork%E2%80%93join_model

#### Type parameters

| Name |
| :------ |
| `T1` |
| `T2` |
| `T3` |
| `T4` |
| `T5` |
| `T6` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | [`T1` \| `PromiseLike`<`T1`\>, `T2` \| `PromiseLike`<`T2`\>, `T3` \| `PromiseLike`<`T3`\>, `T4` \| `PromiseLike`<`T4`\>, `T5` \| `PromiseLike`<`T5`\>, `T6` \| `PromiseLike`<`T6`\>] |

#### Returns

`Promise`<[`T1`, `T2`, `T3`, `T4`, `T5`, `T6`]\>

#### Defined in

[packages/ent-framework/src/helpers.ts:125](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L125)

▸ **join**<`T1`, `T2`, `T3`, `T4`, `T5`\>(`values`): `Promise`<[`T1`, `T2`, `T3`, `T4`, `T5`]\>

Works the same way as Promise-all, but additionally guarantees that ALL OTHER
promises have settled in case one of them rejects. This is needed to ensure
that we never have unexpected "dangling" promises continuing running in
nowhere in case one of the promises rejects early (the behavior of
Promise.all is to reject eagerly and let the rest of stuff running whilst the
caller code unfreezes).

The behavior of join() is similar to Promise.allSettled(), but it throws the
1st exception occurred; this is what's expected in most of the cases, and
this is how promises are implemented in e.g. Hack.

The benefits of ensuring everything is settled:
1. We never have surprising entries in our logs (e.g. imagine a request
   aborted long time ago, and then some "dangling" promises continue running
   and issue SQL queries as if nothing happened).
2. Predictable control flow: if we run `await join()`, we know that no side
   effects from the spawned promises will appear after this await throws or
   returns.

"Join" is a term from parallel programming (e.g. "join threads"), it’s pretty
concrete and means that after the call, multiple parallel execution flows
“join” into one. It's a word to describe having "one" from "many".

What’s interesting is that, besides Promise-all leaks execution flows, it
still doesn’t trigger UnhandledPromiseRejection for them in case one of them
throws later, it just swallows all other exceptions.

I.e. Promise-all means "run all in parallel, if one throws - throw
immediately and let the others continue running in nowhere; if some of THAT
others throws, swallow their exceptions".

And join() means "run all in parallel, if one throws - wait until everyone
finishes, and then throw the 1st exception; if some of others throw, swallow
their exceptions".

See also https://en.wikipedia.org/wiki/Fork%E2%80%93join_model

#### Type parameters

| Name |
| :------ |
| `T1` |
| `T2` |
| `T3` |
| `T4` |
| `T5` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | [`T1` \| `PromiseLike`<`T1`\>, `T2` \| `PromiseLike`<`T2`\>, `T3` \| `PromiseLike`<`T3`\>, `T4` \| `PromiseLike`<`T4`\>, `T5` \| `PromiseLike`<`T5`\>] |

#### Returns

`Promise`<[`T1`, `T2`, `T3`, `T4`, `T5`]\>

#### Defined in

[packages/ent-framework/src/helpers.ts:136](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L136)

▸ **join**<`T1`, `T2`, `T3`, `T4`\>(`values`): `Promise`<[`T1`, `T2`, `T3`, `T4`]\>

Works the same way as Promise-all, but additionally guarantees that ALL OTHER
promises have settled in case one of them rejects. This is needed to ensure
that we never have unexpected "dangling" promises continuing running in
nowhere in case one of the promises rejects early (the behavior of
Promise.all is to reject eagerly and let the rest of stuff running whilst the
caller code unfreezes).

The behavior of join() is similar to Promise.allSettled(), but it throws the
1st exception occurred; this is what's expected in most of the cases, and
this is how promises are implemented in e.g. Hack.

The benefits of ensuring everything is settled:
1. We never have surprising entries in our logs (e.g. imagine a request
   aborted long time ago, and then some "dangling" promises continue running
   and issue SQL queries as if nothing happened).
2. Predictable control flow: if we run `await join()`, we know that no side
   effects from the spawned promises will appear after this await throws or
   returns.

"Join" is a term from parallel programming (e.g. "join threads"), it’s pretty
concrete and means that after the call, multiple parallel execution flows
“join” into one. It's a word to describe having "one" from "many".

What’s interesting is that, besides Promise-all leaks execution flows, it
still doesn’t trigger UnhandledPromiseRejection for them in case one of them
throws later, it just swallows all other exceptions.

I.e. Promise-all means "run all in parallel, if one throws - throw
immediately and let the others continue running in nowhere; if some of THAT
others throws, swallow their exceptions".

And join() means "run all in parallel, if one throws - wait until everyone
finishes, and then throw the 1st exception; if some of others throw, swallow
their exceptions".

See also https://en.wikipedia.org/wiki/Fork%E2%80%93join_model

#### Type parameters

| Name |
| :------ |
| `T1` |
| `T2` |
| `T3` |
| `T4` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | [`T1` \| `PromiseLike`<`T1`\>, `T2` \| `PromiseLike`<`T2`\>, `T3` \| `PromiseLike`<`T3`\>, `T4` \| `PromiseLike`<`T4`\>] |

#### Returns

`Promise`<[`T1`, `T2`, `T3`, `T4`]\>

#### Defined in

[packages/ent-framework/src/helpers.ts:146](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L146)

▸ **join**<`T1`, `T2`, `T3`\>(`values`): `Promise`<[`T1`, `T2`, `T3`]\>

Works the same way as Promise-all, but additionally guarantees that ALL OTHER
promises have settled in case one of them rejects. This is needed to ensure
that we never have unexpected "dangling" promises continuing running in
nowhere in case one of the promises rejects early (the behavior of
Promise.all is to reject eagerly and let the rest of stuff running whilst the
caller code unfreezes).

The behavior of join() is similar to Promise.allSettled(), but it throws the
1st exception occurred; this is what's expected in most of the cases, and
this is how promises are implemented in e.g. Hack.

The benefits of ensuring everything is settled:
1. We never have surprising entries in our logs (e.g. imagine a request
   aborted long time ago, and then some "dangling" promises continue running
   and issue SQL queries as if nothing happened).
2. Predictable control flow: if we run `await join()`, we know that no side
   effects from the spawned promises will appear after this await throws or
   returns.

"Join" is a term from parallel programming (e.g. "join threads"), it’s pretty
concrete and means that after the call, multiple parallel execution flows
“join” into one. It's a word to describe having "one" from "many".

What’s interesting is that, besides Promise-all leaks execution flows, it
still doesn’t trigger UnhandledPromiseRejection for them in case one of them
throws later, it just swallows all other exceptions.

I.e. Promise-all means "run all in parallel, if one throws - throw
immediately and let the others continue running in nowhere; if some of THAT
others throws, swallow their exceptions".

And join() means "run all in parallel, if one throws - wait until everyone
finishes, and then throw the 1st exception; if some of others throw, swallow
their exceptions".

See also https://en.wikipedia.org/wiki/Fork%E2%80%93join_model

#### Type parameters

| Name |
| :------ |
| `T1` |
| `T2` |
| `T3` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | [`T1` \| `PromiseLike`<`T1`\>, `T2` \| `PromiseLike`<`T2`\>, `T3` \| `PromiseLike`<`T3`\>] |

#### Returns

`Promise`<[`T1`, `T2`, `T3`]\>

#### Defined in

[packages/ent-framework/src/helpers.ts:155](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L155)

▸ **join**<`T1`, `T2`\>(`values`): `Promise`<[`T1`, `T2`]\>

Works the same way as Promise-all, but additionally guarantees that ALL OTHER
promises have settled in case one of them rejects. This is needed to ensure
that we never have unexpected "dangling" promises continuing running in
nowhere in case one of the promises rejects early (the behavior of
Promise.all is to reject eagerly and let the rest of stuff running whilst the
caller code unfreezes).

The behavior of join() is similar to Promise.allSettled(), but it throws the
1st exception occurred; this is what's expected in most of the cases, and
this is how promises are implemented in e.g. Hack.

The benefits of ensuring everything is settled:
1. We never have surprising entries in our logs (e.g. imagine a request
   aborted long time ago, and then some "dangling" promises continue running
   and issue SQL queries as if nothing happened).
2. Predictable control flow: if we run `await join()`, we know that no side
   effects from the spawned promises will appear after this await throws or
   returns.

"Join" is a term from parallel programming (e.g. "join threads"), it’s pretty
concrete and means that after the call, multiple parallel execution flows
“join” into one. It's a word to describe having "one" from "many".

What’s interesting is that, besides Promise-all leaks execution flows, it
still doesn’t trigger UnhandledPromiseRejection for them in case one of them
throws later, it just swallows all other exceptions.

I.e. Promise-all means "run all in parallel, if one throws - throw
immediately and let the others continue running in nowhere; if some of THAT
others throws, swallow their exceptions".

And join() means "run all in parallel, if one throws - wait until everyone
finishes, and then throw the 1st exception; if some of others throw, swallow
their exceptions".

See also https://en.wikipedia.org/wiki/Fork%E2%80%93join_model

#### Type parameters

| Name |
| :------ |
| `T1` |
| `T2` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | [`T1` \| `PromiseLike`<`T1`\>, `T2` \| `PromiseLike`<`T2`\>] |

#### Returns

`Promise`<[`T1`, `T2`]\>

#### Defined in

[packages/ent-framework/src/helpers.ts:159](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L159)

▸ **join**<`T`\>(`values`): `Promise`<`T`[]\>

Works the same way as Promise-all, but additionally guarantees that ALL OTHER
promises have settled in case one of them rejects. This is needed to ensure
that we never have unexpected "dangling" promises continuing running in
nowhere in case one of the promises rejects early (the behavior of
Promise.all is to reject eagerly and let the rest of stuff running whilst the
caller code unfreezes).

The behavior of join() is similar to Promise.allSettled(), but it throws the
1st exception occurred; this is what's expected in most of the cases, and
this is how promises are implemented in e.g. Hack.

The benefits of ensuring everything is settled:
1. We never have surprising entries in our logs (e.g. imagine a request
   aborted long time ago, and then some "dangling" promises continue running
   and issue SQL queries as if nothing happened).
2. Predictable control flow: if we run `await join()`, we know that no side
   effects from the spawned promises will appear after this await throws or
   returns.

"Join" is a term from parallel programming (e.g. "join threads"), it’s pretty
concrete and means that after the call, multiple parallel execution flows
“join” into one. It's a word to describe having "one" from "many".

What’s interesting is that, besides Promise-all leaks execution flows, it
still doesn’t trigger UnhandledPromiseRejection for them in case one of them
throws later, it just swallows all other exceptions.

I.e. Promise-all means "run all in parallel, if one throws - throw
immediately and let the others continue running in nowhere; if some of THAT
others throws, swallow their exceptions".

And join() means "run all in parallel, if one throws - wait until everyone
finishes, and then throw the 1st exception; if some of others throw, swallow
their exceptions".

See also https://en.wikipedia.org/wiki/Fork%E2%80%93join_model

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | (`T` \| `PromiseLike`<`T`\>)[] |

#### Returns

`Promise`<`T`[]\>

#### Defined in

[packages/ent-framework/src/helpers.ts:163](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L163)

___

### localUniqueInt

▸ **localUniqueInt**(): `number`

A simple sequence generator which never returns the same value twice within
the same process. It's NOT random, NOT for cryptography, NOT stored (so
starts from scratch on a process restart) and is NOT shared with other
processes.

#### Returns

`number`

#### Defined in

[packages/ent-framework/src/helpers.ts:91](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L91)

___

### mapJoin

▸ **mapJoin**<`TElem`, `TRet`\>(`arr`, `func`): `Promise`<`TRet`[]\>

A shortcut for `await join(arr.map(async ...))`.

#### Type parameters

| Name |
| :------ |
| `TElem` |
| `TRet` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `arr` | readonly `TElem`[] \| `Promise`<readonly `TElem`[]\> |
| `func` | (`e`: `TElem`, `idx`: `number`) => `PromiseLike`<`TRet`\> |

#### Returns

`Promise`<`TRet`[]\>

#### Defined in

[packages/ent-framework/src/helpers.ts:226](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L226)

___

### memoize2

▸ **memoize2**<`TTag`, `TArg1`, `TArg2`, `TResult`\>(`obj`, `tag`, `func`): typeof `func`

A simple intrusive 1-slot cache memoization helper for 2 parameters
functions. It's useful when we have a very high chance of hit rate and is
faster (and more memory efficient) than a Map<TArg1, Map<TArg2, TResult>>
based approach since it doesn't create intermediate maps.

This method works seamlessly for async functions too: the returned Promise is
eagerly memoized, so all the callers will subscribe to the same Promise.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TTag` | extends `symbol` |
| `TArg1` | `TArg1` |
| `TArg2` | `TArg2` |
| `TResult` | `TResult` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `object` |
| `tag` | `TTag` |
| `func` | (`arg1`: `TArg1`, `arg2`: `TArg2`) => `TResult` |

#### Returns

typeof `func`

#### Defined in

[packages/ent-framework/src/memoize2.ts:10](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/memoize2.ts#L10)

___

### minifyStack

▸ **minifyStack**(`stack`, `framesToPop`): `string`

Tries to minify a stacktrace by removing common parts of the paths. See unit
test with snapshot for examples.

#### Parameters

| Name | Type |
| :------ | :------ |
| `stack` | `string` |
| `framesToPop` | `number` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/helpers.ts:70](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L70)

___

### nullthrows

▸ **nullthrows**<`T`\>(`x?`, `message?`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `x?` | ``null`` \| `T` |
| `message?` | `string` \| `Error` |

#### Returns

`T`

#### Defined in

[packages/ent-framework/src/helpers.ts:233](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L233)

___

### parseLsn

▸ **parseLsn**(`lsn`): ``null`` \| `bigint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `lsn` | `undefined` \| ``null`` \| `string` |

#### Returns

``null`` \| `bigint`

#### Defined in

[packages/ent-framework/src/sql/SQLClient.ts:72](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClient.ts#L72)

___

### runInVoid

▸ **runInVoid**(`funcOrPromise`): `void`

Two modes:
1. If an async (or sync) function is passed, spawns it in background and
   doesn't await for its termination.
2. If a Promise is passed, lets it continue executing, doesn't await on it.

Useful when we want to launch a function "in the air", "hanging in nowhere",
and make no-misused-promises and no-floating-promises rules happy with it. An
example is some legacy callback-based API (e.g. chrome extension API) where
we want to pass an async function.

It's like an analog of "async on intent" comment in the code.

#### Parameters

| Name | Type |
| :------ | :------ |
| `funcOrPromise` | `void` \| `Promise`<`unknown`\> \| () => `void` \| `Promise`<`unknown`\> |

#### Returns

`void`

#### Defined in

[packages/ent-framework/src/helpers.ts:259](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L259)

___

### sanitizeIDForDebugPrinting

▸ **sanitizeIDForDebugPrinting**(`id`): `string`

Prepares something which is claimed to be an ID for debug printing in e.g.
exception messages. We replace all non-ASCII characters to their \u
representations.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `any` |

#### Returns

`string`

#### Defined in

[packages/ent-framework/src/helpers.ts:115](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L115)

___

### toFloatMs

▸ **toFloatMs**(`elapsed`): `number`

A wrapper around process.hrtime() to quickly calculate time deltas:
const timeStart = process.hrtime();
...
const elapsedMs = toFloatMs(process.hrtime(timeStart));

#### Parameters

| Name | Type |
| :------ | :------ |
| `elapsed` | [`number`, `number`] |

#### Returns

`number`

#### Defined in

[packages/ent-framework/src/helpers.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L31)

___

### toFloatSec

▸ **toFloatSec**(`elapsed`): `number`

Same as toFloatMs(), but returns seconds.

#### Parameters

| Name | Type |
| :------ | :------ |
| `elapsed` | [`number`, `number`] |

#### Returns

`number`

#### Defined in

[packages/ent-framework/src/helpers.ts:38](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/helpers.ts#L38)
