[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / UpdateOriginalInput

# Type Alias: UpdateOriginalInput\<TTable\>

> **UpdateOriginalInput**\<`TTable`\>: `{ [K in UpdateField<TTable>]?: Value<TTable[K]> }` & `object`

The input of updateOriginal() method. It supports some additional syntax
sugar for $cas property, so to work-around TS weakness of Omit<> & type
inference, we redefine this type from scratch.

## Type declaration

### $literal?

> `optional` **$literal**: [`Literal`](Literal.md)

### $cas?

> `optional` **$cas**: `"skip-if-someone-else-changed-updating-ent-props"` \| `ReadonlyArray`\<[`UpdateField`](UpdateField.md)\<`TTable`\>\> \| [`UpdateInput`](UpdateInput.md)\<`TTable`\>\[`"$cas"`\]

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Defined in

[src/ent/types.ts:81](https://github.com/clickup/ent-framework/blob/master/src/ent/types.ts#L81)
