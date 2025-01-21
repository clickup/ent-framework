[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / TriggerUpdateNewRow

# Type Alias: TriggerUpdateNewRow\<TTable\>

> **TriggerUpdateNewRow**\<`TTable`\>: `Flatten`\<`Readonly`\<[`Row`](Row.md)\<`TTable`\> & `{ [K in keyof TTable & symbol]?: Value<TTable[K]> }`\>\>

Defined in: [src/ent/Triggers.ts:38](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L38)

Table -> trigger's before- and after-update NEW row. Ephemeral (symbol)
fields may or may not be passed depending on what the user passes to the
update method.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
