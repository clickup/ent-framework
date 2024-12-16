[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / HelpersMixin

# Function: HelpersMixin()

> **HelpersMixin**\<`TTable`, `TUniqueKey`, `TClient`\>(`Base`): [`HelpersClass`](../interfaces/HelpersClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding convenience methods (like loadX() which
throws when an Ent can't be loaded instead of returning null as it's done in
the primitive operations).

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> |
| `TClient` *extends* [`Client`](../classes/Client.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `Base` | [`PrimitiveClass`](../type-aliases/PrimitiveClass.md)\<`TTable`, `TUniqueKey`, `TClient`\> |

## Returns

[`HelpersClass`](../interfaces/HelpersClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

## Defined in

[src/ent/mixins/HelpersMixin.ts:138](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/HelpersMixin.ts#L138)
