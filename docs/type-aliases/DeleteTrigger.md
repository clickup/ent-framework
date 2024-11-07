[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / DeleteTrigger

# Type Alias: DeleteTrigger()\<TTable\>

> **DeleteTrigger**\<`TTable`\>: (`vc`, `args`) => `Promise`\<`unknown`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `args` | `object` |
| `args.oldRow` | [`TriggerUpdateOrDeleteOldRow`](TriggerUpdateOrDeleteOldRow.md)\<`TTable`\> |

## Returns

`Promise`\<`unknown`\>

## Defined in

[src/ent/Triggers.ts:116](https://github.com/clickup/ent-framework/blob/master/src/ent/Triggers.ts#L116)
