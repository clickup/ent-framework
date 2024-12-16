[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / CanDeleteOutgoingEdge

# Class: CanDeleteOutgoingEdge\<TField\>

Checks that an Ent available via a field can be deleted, or Ent doesn't exist
(e.g. Ent is orphaned). See CanReadOutgoingEdge comments for more details.

## Type Parameters

| Type Parameter |
| ------ |
| `TField` *extends* `string` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`Record`\<`TField`, `string` \| `null`\>\>

## Constructors

### new CanDeleteOutgoingEdge()

> **new CanDeleteOutgoingEdge**\<`TField`\>(`field`, `toEntClass`): [`CanDeleteOutgoingEdge`](CanDeleteOutgoingEdge.md)\<`TField`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | `TField` |
| `toEntClass` | [`EntClass`](../interfaces/EntClass.md) |

#### Returns

[`CanDeleteOutgoingEdge`](CanDeleteOutgoingEdge.md)\<`TField`\>

#### Defined in

[src/ent/predicates/CanDeleteOutgoingEdge.ts:15](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanDeleteOutgoingEdge.ts#L15)

## Properties

| Property | Type |
| ------ | ------ |
| `name` | `string` |
| `field` | `TField` |
| `toEntClass` | [`EntClass`](../interfaces/EntClass.md) |

## Methods

### check()

> **check**(`vc`, `row`): `Promise`\<`boolean`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | `Record`\<`TField`, `null` \| `string`\> |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/CanDeleteOutgoingEdge.ts:22](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanDeleteOutgoingEdge.ts#L22)
