[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / buildUpdateNewRow

# Function: buildUpdateNewRow()

> **buildUpdateNewRow**\<`TTable`\>(`oldRow`, `input`): [`TriggerUpdateNewRow`](../type-aliases/TriggerUpdateNewRow.md)\<`TTable`\>

Simulates an update for a row, as if it's applied to the Ent.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `oldRow` | [`Row`](../type-aliases/Row.md)\<`TTable`\> |
| `input` | [`UpdateInput`](../type-aliases/UpdateInput.md)\<`TTable`\> |

## Returns

[`TriggerUpdateNewRow`](../type-aliases/TriggerUpdateNewRow.md)\<`TTable`\>

## Defined in

[src/ent/Triggers.ts:354](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L354)
