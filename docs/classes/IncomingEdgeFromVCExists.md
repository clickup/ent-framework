[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / IncomingEdgeFromVCExists

# Class: IncomingEdgeFromVCExists\<TEdgeTable\>

An ent may represent not necessarily a node in the graph, but also an edge
between two nodes. Consider EntMember in the below example:

vc.principal <--- EntMember[user_id, company_id] ---> EntCompany

This predicate verifies that for a e.g. given EntCompany row and a given VC,
an EntMember row exists (and optionally matches some criterion) in the
database.

- entEdgeVCField = user_id in the above example
- entEdgeFKField = company_id in the above example
- if an EntMember object exists, it must also match entEdgeFilter()

## Type Parameters

| Type Parameter |
| ------ |
| `TEdgeTable` *extends* [`Table`](../type-aliases/Table.md) |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<[`RowWithID`](../type-aliases/RowWithID.md)\>

## Constructors

### new IncomingEdgeFromVCExists()

> **new IncomingEdgeFromVCExists**\<`TEdgeTable`\>(`EntEdge`, `entEdgeVCField`, `entEdgeFKField`, `entEdgeFilter`?): [`IncomingEdgeFromVCExists`](IncomingEdgeFromVCExists.md)\<`TEdgeTable`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `EntEdge` | [`EntClass`](../interfaces/EntClass.md)\<`TEdgeTable`\> |
| `entEdgeVCField` | `"id"` \| [`Field`](../type-aliases/Field.md)\<`TEdgeTable`\> |
| `entEdgeFKField` | `"id"` \| [`Field`](../type-aliases/Field.md)\<`TEdgeTable`\> |
| `entEdgeFilter`? | (`ent`) => `boolean` |

#### Returns

[`IncomingEdgeFromVCExists`](IncomingEdgeFromVCExists.md)\<`TEdgeTable`\>

#### Defined in

[src/ent/predicates/IncomingEdgeFromVCExists.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L29)

## Properties

| Property | Type |
| ------ | ------ |
| `name` | `string` |
| `EntEdge` | [`EntClass`](../interfaces/EntClass.md)\<`TEdgeTable`\> |
| `entEdgeVCField` | `"id"` \| [`Field`](../type-aliases/Field.md)\<`TEdgeTable`\> |
| `entEdgeFKField` | `"id"` \| [`Field`](../type-aliases/Field.md)\<`TEdgeTable`\> |
| `entEdgeFilter?` | (`ent`: [`Row`](../type-aliases/Row.md)\<`TEdgeTable`\>) => `boolean` |

## Methods

### check()

> **check**(`vc`, `row`): `Promise`\<`boolean`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`RowWithID`](../type-aliases/RowWithID.md) |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/IncomingEdgeFromVCExists.ts:46](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L46)
