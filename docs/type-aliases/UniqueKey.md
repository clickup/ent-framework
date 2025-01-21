[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / UniqueKey

# Type Alias: UniqueKey\<TTable\>

> **UniqueKey**\<`TTable`\>: \[\] \| \[[`FieldOfPotentialUniqueKey`](FieldOfPotentialUniqueKey.md)\<`TTable`\>, `...FieldOfPotentialUniqueKey<TTable>[]`\]

Defined in: [src/types.ts:240](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L240)

Table -> ["field1", "field2", ...], list of fields allowed to compose an
unique key on the table; fields must be allowed in insert/upsert.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
