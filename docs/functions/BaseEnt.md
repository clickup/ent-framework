[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / BaseEnt

# Function: BaseEnt()

> **BaseEnt**\<`TTable`, `TUniqueKey`, `TClient`\>(`cluster`, `schema`): [`HelpersClass`](../interfaces/HelpersClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>

Defined in: [src/ent/BaseEnt.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/BaseEnt.ts#L29)

This is a helper function to create new Ent classes. Run once per each
Ent+Cluster on app boot. See examples in __tests__/TestObjects.ts and
EntTest.ts.

Since all Ent objects are immutable (following the modern practices),
1. Ent is not a DataMapper pattern;
2. Ent is not an ActiveRecord;
3. At last, Ent is not quite a DAO pattern too.

We assume that Ents are very simple (we don't need triggers or multi-ent
touching mutations), because we anyway have a GraphQL layer on top of it.

Finally, a naming decision has been made: we translate database field names
directly to Ent field names, no camelCase. This has proven its simplicity
benefits in the past: the less translation layers we have, the easier it is
to debug and develop.

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](../type-aliases/Table.md) |
| `TUniqueKey` *extends* [`UniqueKey`](../type-aliases/UniqueKey.md)\<`TTable`\> |
| `TClient` *extends* [`Client`](../classes/Client.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `cluster` | [`Cluster`](../classes/Cluster.md)\<`TClient`, `any`\> |
| `schema` | [`Schema`](../classes/Schema.md)\<`TTable`, `TUniqueKey`\> |

## Returns

[`HelpersClass`](../interfaces/HelpersClass.md)\<`TTable`, `TUniqueKey`, `TClient`\>
