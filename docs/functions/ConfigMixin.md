[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ConfigMixin

# Function: ConfigMixin()

> **ConfigMixin**\<`TTable`, `TUniqueKey`, `TClient`\>(`Base`, `cluster`, `schema`): [`ConfigClass`](../interfaces/ConfigClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

Defined in: [src/ent/mixins/ConfigMixin.ts:86](https://github.com/clickup/ent-framework/blob/master/src/ent/mixins/ConfigMixin.ts#L86)

Modifies the passed class adding support for Ent configuration (such as:
Cluster, table schema, privacy rules, triggers etc.).

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> |
| `TClient` *extends* [`Client`](../classes/Client.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `Base` | () => `object` |
| `cluster` | [`Cluster`](../classes/Cluster.md)\<`TClient`, `any`\> |
| `schema` | [`Schema`](../classes/Schema.md)\<`TTable`, `TUniqueKey`\> |

## Returns

[`ConfigClass`](../interfaces/ConfigClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>
