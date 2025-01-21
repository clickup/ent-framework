[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / IncomingEdgeFromVCExists

# Class: IncomingEdgeFromVCExists\<TEdgeTable\>

Defined in: [src/ent/predicates/IncomingEdgeFromVCExists.ts:23](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L23)

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

Defined in: [src/ent/predicates/IncomingEdgeFromVCExists.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L29)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `EntEdge` | [`EntClass`](../interfaces/EntClass.md)\<`TEdgeTable`\> |
| `entEdgeVCField` | `"id"` \| [`Field`](../type-aliases/Field.md)\<`TEdgeTable`\> |
| `entEdgeFKField` | `"id"` \| [`Field`](../type-aliases/Field.md)\<`TEdgeTable`\> |
| `entEdgeFilter`? | (`ent`) => `boolean` |

#### Returns

[`IncomingEdgeFromVCExists`](IncomingEdgeFromVCExists.md)\<`TEdgeTable`\>

## Properties

| Property | Type |
| ------ | ------ |
| <a id="name"></a> `name` | `string` |
| <a id="entedge-1"></a> `EntEdge` | [`EntClass`](../interfaces/EntClass.md)\<`TEdgeTable`\> |
| <a id="entedgevcfield-1"></a> `entEdgeVCField` | `"id"` \| [`Field`](../type-aliases/Field.md)\<`TEdgeTable`\> |
| <a id="entedgefkfield-1"></a> `entEdgeFKField` | `"id"` \| [`Field`](../type-aliases/Field.md)\<`TEdgeTable`\> |
| <a id="entedgefilter-1"></a> `entEdgeFilter?` | (`ent`: [`Row`](../type-aliases/Row.md)\<`TEdgeTable`\>) => `boolean` |

## Methods

### check()

> **check**(`vc`, `row`): `Promise`\<`boolean`\>

Defined in: [src/ent/predicates/IncomingEdgeFromVCExists.ts:46](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L46)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`RowWithID`](../type-aliases/RowWithID.md) |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)
