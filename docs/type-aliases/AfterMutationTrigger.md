[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / AfterMutationTrigger

# Type Alias: AfterMutationTrigger()\<TTable\>

> **AfterMutationTrigger**\<`TTable`\>: (`vc`, `args`) => `Promise`\<`unknown`\> \| `unknown`

Defined in: [src/ent/Triggers.ts:147](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L147)

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `args` | \{ `op`: `"INSERT"`; `newOrOldRow`: `Readonly`\<[`TriggerInsertInput`](TriggerInsertInput.md)\<`TTable`\>\>; \} \| \{ `op`: `"UPDATE"`; `newOrOldRow`: [`TriggerUpdateNewRow`](TriggerUpdateNewRow.md)\<`TTable`\>; \} \| \{ `op`: `"DELETE"`; `newOrOldRow`: [`TriggerUpdateOrDeleteOldRow`](TriggerUpdateOrDeleteOldRow.md)\<`TTable`\>; \} |

## Returns

`Promise`\<`unknown`\> \| `unknown`
