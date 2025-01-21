[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Field

# Type Alias: Field\<TTable\>

> **Field**\<`TTable`\>: keyof `TTable` & `string`

Defined in: [src/types.ts:102](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L102)

A database table's field (no symbols). In regards to some table structure,
there can be 3 options:
1. Field<TTable>: only DB-stored attributes, no ephemeral symbols
2. keyof TTable: both real and ephemeral attributes
3. keyof TTable & symbol: only "ephemeral" attributes available to triggers

By doing `& string`, we ensure that we select only regular (non-symbol)
fields.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
