[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / InsertFieldsRequired

# Type Alias: InsertFieldsRequired\<TTable\>

> **InsertFieldsRequired**\<`TTable`\>: `{ [K in keyof TTable]: TTable[K] extends Object ? never : TTable[K] extends Object ? never : K }`\[keyof `TTable`\]

Insert: Table -> "field1" | "field2" |  ... deduction (required).

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Defined in

[src/types.ts:184](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L184)
