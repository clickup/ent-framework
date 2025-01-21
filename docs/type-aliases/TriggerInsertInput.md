[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / TriggerInsertInput

# Type Alias: TriggerInsertInput\<TTable\>

> **TriggerInsertInput**\<`TTable`\>: `Flatten`\<[`InsertInput`](InsertInput.md)\<`TTable`\> & [`RowWithID`](RowWithID.md)\>

Defined in: [src/ent/Triggers.ts:22](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L22)

Table -> trigger's before- and after-insert input. Below, we use InsertInput
and not Row, because before and even after some INSERT, we may still not know
some values of the row (they can be filled by the DB in e.g. autoInsert
clause). InsertInput is almost a subset of Row, but it has stricter symbol
keys: e.g. if some symbol key is non-optional in INSERT (aka doesn't have
autoInsert), it will always be required in InsertInput too.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
