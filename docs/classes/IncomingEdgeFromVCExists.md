[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / IncomingEdgeFromVCExists

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

## Type parameters

| Name | Type |
| :------ | :------ |
| `TEdgeTable` | extends [`Table`](../modules.md#table) |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<[`RowWithID`](../modules.md#rowwithid)\>

## Constructors

### constructor

• **new IncomingEdgeFromVCExists**\<`TEdgeTable`\>(`EntEdge`, `entEdgeVCField`, `entEdgeFKField`, `entEdgeFilter?`): [`IncomingEdgeFromVCExists`](IncomingEdgeFromVCExists.md)\<`TEdgeTable`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEdgeTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `EntEdge` | [`EntClass`](../modules.md#entclass)\<`TEdgeTable`\> |
| `entEdgeVCField` | ``"id"`` \| [`Field`](../modules.md#field)\<`TEdgeTable`\> |
| `entEdgeFKField` | ``"id"`` \| [`Field`](../modules.md#field)\<`TEdgeTable`\> |
| `entEdgeFilter?` | (`ent`: [`Row`](../modules.md#row)\<`TEdgeTable`\>) => `boolean` |

#### Returns

[`IncomingEdgeFromVCExists`](IncomingEdgeFromVCExists.md)\<`TEdgeTable`\>

#### Defined in

[src/ent/predicates/IncomingEdgeFromVCExists.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L29)

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[src/ent/predicates/IncomingEdgeFromVCExists.ts:27](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L27)

___

### EntEdge

• `Readonly` **EntEdge**: [`EntClass`](../modules.md#entclass)\<`TEdgeTable`\>

#### Defined in

[src/ent/predicates/IncomingEdgeFromVCExists.ts:30](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L30)

___

### entEdgeVCField

• `Readonly` **entEdgeVCField**: ``"id"`` \| [`Field`](../modules.md#field)\<`TEdgeTable`\>

#### Defined in

[src/ent/predicates/IncomingEdgeFromVCExists.ts:31](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L31)

___

### entEdgeFKField

• `Readonly` **entEdgeFKField**: ``"id"`` \| [`Field`](../modules.md#field)\<`TEdgeTable`\>

#### Defined in

[src/ent/predicates/IncomingEdgeFromVCExists.ts:32](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L32)

___

### entEdgeFilter

• `Optional` `Readonly` **entEdgeFilter**: (`ent`: [`Row`](../modules.md#row)\<`TEdgeTable`\>) => `boolean`

#### Type declaration

▸ (`ent`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `ent` | [`Row`](../modules.md#row)\<`TEdgeTable`\> |

##### Returns

`boolean`

#### Defined in

[src/ent/predicates/IncomingEdgeFromVCExists.ts:33](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L33)

## Methods

### check

▸ **check**(`vc`, `row`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`RowWithID`](../modules.md#rowwithid) |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/IncomingEdgeFromVCExists.ts:47](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/IncomingEdgeFromVCExists.ts#L47)
