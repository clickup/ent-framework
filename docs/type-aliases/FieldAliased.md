[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / FieldAliased

# Type Alias: FieldAliased\<TTable\>

> **FieldAliased**\<`TTable`\>: [`Field`](Field.md)\<`TTable`\> \| \{ `field`: [`Field`](Field.md)\<`TTable`\>; `alias`: `string`; \}

Defined in: [src/types.ts:108](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L108)

Same as Field, but may optionally hold information about of "alias value
source" for a field name (e.g. `{ field: "abc", alias: "$cas.abc" }`).

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
