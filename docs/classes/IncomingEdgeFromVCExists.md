[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / IncomingEdgeFromVCExists

# Class: IncomingEdgeFromVCExists<TEdgeTable\>

An ent may represent not necessarily a node in the graph, but also an edge
between two nodes. Consider EntMember in the below example:

vc.userID <--- EntMember[user_id, company_id] ---> EntCompany

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

- [`Predicate`](../interfaces/Predicate.md)<[`RowWithID`](../modules.md#rowwithid)\>

## Constructors

### constructor

• **new IncomingEdgeFromVCExists**<`TEdgeTable`\>(`EntEdge`, `entEdgeVCField`, `entEdgeFKField`, `entEdgeFilter?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEdgeTable` | extends [`Table`](../modules.md#table) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `EntEdge` | [`EntClass`](../interfaces/EntClass.md)<`TEdgeTable`\> |
| `entEdgeVCField` | ``"id"`` \| keyof `TEdgeTable` |
| `entEdgeFKField` | ``"id"`` \| keyof `TEdgeTable` |
| `entEdgeFilter?` | (`ent`: [`Row`](../modules.md#row)<`TEdgeTable`\>) => `boolean` |

#### Defined in

[packages/ent-framework/src/ent/predicates/IncomingEdgeFromVCExists.ts:36](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/IncomingEdgeFromVCExists.ts#L36)

## Properties

### EntEdge

• `Readonly` **EntEdge**: [`EntClass`](../interfaces/EntClass.md)<`TEdgeTable`\>

___

### entEdgeFKField

• `Readonly` **entEdgeFKField**: ``"id"`` \| keyof `TEdgeTable`

___

### entEdgeFilter

• `Optional` `Readonly` **entEdgeFilter**: (`ent`: [`Row`](../modules.md#row)<`TEdgeTable`\>) => `boolean`

#### Type declaration

▸ (`ent`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `ent` | [`Row`](../modules.md#row)<`TEdgeTable`\> |

##### Returns

`boolean`

___

### entEdgeVCField

• `Readonly` **entEdgeVCField**: ``"id"`` \| keyof `TEdgeTable`

___

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[packages/ent-framework/src/ent/predicates/IncomingEdgeFromVCExists.ts:25](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/IncomingEdgeFromVCExists.ts#L25)

## Methods

### check

▸ **check**(`vc`, `row`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | [`RowWithID`](../modules.md#rowwithid) |

#### Returns

`Promise`<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[packages/ent-framework/src/ent/predicates/IncomingEdgeFromVCExists.ts:43](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/IncomingEdgeFromVCExists.ts#L43)
