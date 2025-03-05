[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / InsertFieldsRequired

# Type Alias: InsertFieldsRequired\<TTable\>

> **InsertFieldsRequired**\<`TTable`\>: `{ [K in keyof TTable]: TTable[K] extends { autoInsert: unknown } ? never : TTable[K] extends { autoUpdate: unknown } ? never : K }`\[keyof `TTable`\]

Defined in: [src/types.ts:190](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L190)

Insert: Table -> "field1" | "field2" |  ... deduction (required).

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
