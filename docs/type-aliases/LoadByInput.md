[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / LoadByInput

# Type Alias: LoadByInput\<TTable, TUniqueKey\>

> **LoadByInput**\<`TTable`, `TUniqueKey`\>: `TUniqueKey` *extends* [] ? `never` : `{ [K in TUniqueKey[number]]: Value<TTable[K]> }`

(Table, UniqueKey) -> { field1: number, field2: number, field3: number }.
loadBy operation is allowed for exact unique key attributes only.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](UniqueKey.md)\<`TTable`\> |

## Defined in

[src/types.ts:251](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L251)
