[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / DeleteTrigger

# Type Alias: DeleteTrigger()\<TTable\>

> **DeleteTrigger**\<`TTable`\>: (`vc`, `args`) => `Promise`\<`unknown`\> \| `unknown`

Defined in: [src/ent/Triggers.ts:116](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L116)

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `args` | \{ `oldRow`: [`TriggerUpdateOrDeleteOldRow`](TriggerUpdateOrDeleteOldRow.md)\<`TTable`\>; \} |
| `args.oldRow` | [`TriggerUpdateOrDeleteOldRow`](TriggerUpdateOrDeleteOldRow.md)\<`TTable`\> |

## Returns

`Promise`\<`unknown`\> \| `unknown`
