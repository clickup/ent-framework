[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / FieldOfPotentialUniqueKey

# Type Alias: FieldOfPotentialUniqueKey\<TTable\>

> **FieldOfPotentialUniqueKey**\<`TTable`\>: \{ \[K in Field\<TTable\>\]: TTable\[K\] extends \{ type: typeof Number \| typeof String \| typeof Boolean \| typeof ID \| typeof Date \| \{ dbValueToJs: (dbValue: never) =\> string \| number \} \} ? K : never \}\[[`Field`](Field.md)\<`TTable`\>\]

Defined in: [src/types.ts:116](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L116)

(Table) -> "field1" | "field2" | ... where the union contains only fields
which can potentially be used as a part of unique key.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
