[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / InsertInput

# Type Alias: InsertInput\<TTable\>

> **InsertInput**\<`TTable`\>: `{ [K in InsertFieldsRequired<TTable>]: Value<TTable[K]> }` & `{ [K in InsertFieldsOptional<TTable>]?: Value<TTable[K]> }`

Defined in: [src/types.ts:207](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L207)

Insert: Table -> { field: string, updated_at?: Date, created_at?: Date... }.
Excludes id Spec entirely and makes autoInsert/autoUpdate Specs optional.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
