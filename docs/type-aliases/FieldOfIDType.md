[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / FieldOfIDType

# Type Alias: FieldOfIDType\<TTable\>

> **FieldOfIDType**\<`TTable`\>: `{ [K in Field<TTable>]: K extends string ? TTable[K] extends { type: typeof ID } ? K : never : never }`\[[`Field`](Field.md)\<`TTable`\>\]

Table -> "user_id" | "some_id" | ...

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Defined in

[src/types.ts:128](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L128)