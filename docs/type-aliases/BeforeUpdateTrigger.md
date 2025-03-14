[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / BeforeUpdateTrigger

# Type Alias: BeforeUpdateTrigger()\<TTable\>

> **BeforeUpdateTrigger**\<`TTable`\>: (`vc`, `args`) => `Promise`\<`unknown`\> \| `unknown`

Defined in: [src/ent/Triggers.ts:99](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L99)

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `args` | \{ `newRow`: [`TriggerUpdateNewRow`](TriggerUpdateNewRow.md)\<`TTable`\>; `oldRow`: [`TriggerUpdateOrDeleteOldRow`](TriggerUpdateOrDeleteOldRow.md)\<`TTable`\>; `input`: [`TriggerUpdateInput`](TriggerUpdateInput.md)\<`TTable`\>; \} |
| `args.newRow` | [`TriggerUpdateNewRow`](TriggerUpdateNewRow.md)\<`TTable`\> |
| `args.oldRow` | [`TriggerUpdateOrDeleteOldRow`](TriggerUpdateOrDeleteOldRow.md)\<`TTable`\> |
| `args.input` | [`TriggerUpdateInput`](TriggerUpdateInput.md)\<`TTable`\> |

## Returns

`Promise`\<`unknown`\> \| `unknown`
