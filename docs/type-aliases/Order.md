[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Order

# Type Alias: Order\<TTable\>

> **Order**\<`TTable`\>: `ReadonlyArray`\<`{ [K in Field<TTable>]?: string }` & `object`\>

Defined in: [src/types.ts:304](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L304)

Table -> [["f1", "ASC"], ["f2", "DESC"]] or [ [{[$literal]: ["a=?", 10]},
"ASC"], ["b", "DESC"] ]

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
