[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / InsertTrigger

# Type Alias: InsertTrigger()\<TTable\>

> **InsertTrigger**\<`TTable`\>: (`vc`, `args`) => `Promise`\<`unknown`\>

Defined in: [src/ent/Triggers.ts:94](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L94)

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

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `args` | \{ `input`: [`TriggerInsertInput`](TriggerInsertInput.md)\<`TTable`\>; \} |
| `args.input` | [`TriggerInsertInput`](TriggerInsertInput.md)\<`TTable`\> |

## Returns

`Promise`\<`unknown`\>
