[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / CanDeleteOutgoingEdge

# Class: CanDeleteOutgoingEdge\<TField\>

Checks that an Ent available via a field can be deleted, or Ent doesn't exist
(e.g. Ent is orphaned). See CanReadOutgoingEdge comments for more details.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`Record`\<`TField`, `string` \| ``null``\>\>

## Constructors

### constructor

• **new CanDeleteOutgoingEdge**\<`TField`\>(`field`, `toEntClass`): [`CanDeleteOutgoingEdge`](CanDeleteOutgoingEdge.md)\<`TField`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TField` | extends `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `TField` |
| `toEntClass` | [`EntClass`](../modules.md#entclass) |

#### Returns

[`CanDeleteOutgoingEdge`](CanDeleteOutgoingEdge.md)\<`TField`\>

#### Defined in

src/ent/predicates/CanDeleteOutgoingEdge.ts:15

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

src/ent/predicates/CanDeleteOutgoingEdge.ts:13

___

### field

• `Readonly` **field**: `TField`

#### Defined in

src/ent/predicates/CanDeleteOutgoingEdge.ts:16

___

### toEntClass

• `Readonly` **toEntClass**: [`EntClass`](../modules.md#entclass)

#### Defined in

src/ent/predicates/CanDeleteOutgoingEdge.ts:17

## Methods

### check

▸ **check**(`vc`, `row`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `row` | `Record`\<`TField`, ``null`` \| `string`\> |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

src/ent/predicates/CanDeleteOutgoingEdge.ts:22
