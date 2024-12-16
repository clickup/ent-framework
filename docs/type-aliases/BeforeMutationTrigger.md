[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / BeforeMutationTrigger

# Type Alias: BeforeMutationTrigger()\<TTable\>

> **BeforeMutationTrigger**\<`TTable`\>: (`vc`, `args`) => `Promise`\<`unknown`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `args` | \{ `op`: `"INSERT"`; `newOrOldRow`: `Readonly`\<[`TriggerInsertInput`](TriggerInsertInput.md)\<`TTable`\>\>; `input`: [`TriggerInsertInput`](TriggerInsertInput.md)\<`TTable`\>; \} \| \{ `op`: `"UPDATE"`; `newOrOldRow`: [`TriggerUpdateNewRow`](TriggerUpdateNewRow.md)\<`TTable`\>; `input`: [`TriggerUpdateInput`](TriggerUpdateInput.md)\<`TTable`\>; \} \| \{ `op`: `"DELETE"`; `newOrOldRow`: [`TriggerUpdateOrDeleteOldRow`](TriggerUpdateOrDeleteOldRow.md)\<`TTable`\>; `input`: `Writeable`\<[`TriggerUpdateOrDeleteOldRow`](TriggerUpdateOrDeleteOldRow.md)\<`TTable`\>\>; \} |

## Returns

`Promise`\<`unknown`\>

## Defined in

[src/ent/Triggers.ts:123](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L123)
