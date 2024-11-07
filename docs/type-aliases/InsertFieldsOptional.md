[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / InsertFieldsOptional

# Type Alias: InsertFieldsOptional\<TTable\>

> **InsertFieldsOptional**\<`TTable`\>: `{ [K in keyof TTable]: TTable[K] extends Object ? K : TTable[K] extends Object ? K : never }`\[keyof `TTable`\]

Insert: Table -> "created_at" | "field2" |  ... deduction (optional fields).

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Defined in

[src/types.ts:195](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L195)
