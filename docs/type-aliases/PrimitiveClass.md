[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PrimitiveClass

# Type Alias: PrimitiveClass\<TTable, TUniqueKey, TClient\>

> **PrimitiveClass**\<`TTable`, `TUniqueKey`, `TClient`\>: `OmitNew`\<[`ConfigClass`](../interfaces/ConfigClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>\> & () => [`PrimitiveInstance`](../interfaces/PrimitiveInstance.md)\<`TTable`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](UniqueKey.md)\<`TTable`\> |
| `TClient` *extends* [`Client`](../classes/Client.md) |

## Defined in

[src/ent/mixins/PrimitiveMixin.ts:67](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/PrimitiveMixin.ts#L67)
