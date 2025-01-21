[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / UpdateInput

# Type Alias: UpdateInput\<TTable\>

> **UpdateInput**\<`TTable`\>: `{ [K in UpdateField<TTable>]?: Value<TTable[K]> }` & `object`

Defined in: [src/types.ts:229](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L229)

Update: Table -> { field?: string, created_at?: Date, updated_at?: Date }.
- Excludes id Spec entirely and makes all fields optional.
- If $literal is passed, it will be appended to the list of updating fields
  (engine specific).
- If $cas is passed, only the rows whose fields match the exact values in
  $cas will be updated; the non-matching rows will be skipped.

## Type declaration

### $literal?

> `optional` **$literal**: [`Literal`](Literal.md)

### $cas?

> `optional` **$cas**: `{ [K in UpdateField<TTable>]?: Value<TTable[K]> }`

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
