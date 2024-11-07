[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / InsertInput

# Type Alias: InsertInput\<TTable\>

> **InsertInput**\<`TTable`\>: `{ [K in InsertFieldsRequired<TTable>]: Value<TTable[K]> }` & `{ [K in InsertFieldsOptional<TTable>]?: Value<TTable[K]> }`

Insert: Table -> { field: string, updated_at?: Date, created_at?: Date... }.
Excludes id Spec entirely and makes autoInsert/autoUpdate Specs optional.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Defined in

[src/types.ts:207](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L207)
