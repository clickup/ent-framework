[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / AfterUpdateTrigger

# Type Alias: AfterUpdateTrigger()\<TTable\>

> **AfterUpdateTrigger**\<`TTable`\>: (`vc`, `args`) => `Promise`\<`unknown`\> \| `unknown`

Defined in: [src/ent/Triggers.ts:108](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L108)

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `args` | \{ `newRow`: [`TriggerUpdateNewRow`](TriggerUpdateNewRow.md)\<`TTable`\>; `oldRow`: [`TriggerUpdateOrDeleteOldRow`](TriggerUpdateOrDeleteOldRow.md)\<`TTable`\>; \} |
| `args.newRow` | [`TriggerUpdateNewRow`](TriggerUpdateNewRow.md)\<`TTable`\> |
| `args.oldRow` | [`TriggerUpdateOrDeleteOldRow`](TriggerUpdateOrDeleteOldRow.md)\<`TTable`\> |

## Returns

`Promise`\<`unknown`\> \| `unknown`
