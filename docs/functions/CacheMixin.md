[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / CacheMixin

# Function: CacheMixin()

> **CacheMixin**\<`TTable`, `TUniqueKey`, `TClient`\>(`Base`): [`PrimitiveClass`](../type-aliases/PrimitiveClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding VC-stored cache layer to it.

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

[`PrimitiveClass`](../type-aliases/PrimitiveClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

## Defined in

[src/ent/mixins/CacheMixin.ts:20](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/CacheMixin.ts#L20)
