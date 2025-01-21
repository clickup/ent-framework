[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / TriggerUpdateOrDeleteOldRow

# Type Alias: TriggerUpdateOrDeleteOldRow\<TTable\>

> **TriggerUpdateOrDeleteOldRow**\<`TTable`\>: `Flatten`\<`Readonly`\<[`Row`](Row.md)\<`TTable`\> & `Record`\<keyof `TTable` & `symbol`, `never`\>\>\>

Defined in: [src/ent/Triggers.ts:52](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L52)

Table -> trigger's before- and after-update (or delete) OLD row. Ephemeral
(symbol) fields are marked as always presented, but "never" typed, so they
will be available for dereferencing in newOrOldRow of before/after mutation
triggers without guard-checking of op value.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
