[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / SelectByInput

# Type Alias: SelectByInput\<TTable, TUniqueKey\>

> **SelectByInput**\<`TTable`, `TUniqueKey`\>: [`LoadByInput`](LoadByInput.md)\<`TTable`, `TuplePrefixes`\<`TUniqueKey`\>\>

Defined in: [src/types.ts:268](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L268)

(Table, UniqueKey) -> { field1: number [, field2: number [, ...] ] }.
selectBy operation is allowed for unique key PREFIX attributes only.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](UniqueKey.md)\<`TTable`\> |
