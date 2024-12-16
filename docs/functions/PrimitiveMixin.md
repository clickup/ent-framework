[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PrimitiveMixin

# Function: PrimitiveMixin()

> **PrimitiveMixin**\<`TTable`, `TUniqueKey`, `TClient`\>(`Base`): [`PrimitiveClass`](../type-aliases/PrimitiveClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

Modifies the passed class adding support for the minimal number of basic Ent
operations. Internally, uses Schema abstractions to run them.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> |
| `TClient` *extends* [`Client`](../classes/Client.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `Base` | [`ConfigClass`](../interfaces/ConfigClass.md)\<`TTable`, `TUniqueKey`, `TClient`\> |

## Returns

[`PrimitiveClass`](../type-aliases/PrimitiveClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

## Defined in

[src/ent/mixins/PrimitiveMixin.ts:196](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L196)
