[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / OutgoingEdgePointsToVC

# Class: OutgoingEdgePointsToVC\<TField\>

Checks that the field's value is the same as VC's principal:

EntOur[user_id] ---> vc.principal

## Type Parameters

| Type Parameter |
| ------ |
| `TField` *extends* `string` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`Record`\<`TField`, `string` \| `null`\>\>

## Constructors

### new OutgoingEdgePointsToVC()

> **new OutgoingEdgePointsToVC**\<`TField`\>(`field`): [`OutgoingEdgePointsToVC`](OutgoingEdgePointsToVC.md)\<`TField`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | `TField` |

#### Returns

[`OutgoingEdgePointsToVC`](OutgoingEdgePointsToVC.md)\<`TField`\>

#### Defined in

[src/ent/predicates/OutgoingEdgePointsToVC.ts:14](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/OutgoingEdgePointsToVC.ts#L14)

## Properties

| Property | Type |
| ------ | ------ |
| `name` | `string` |
| `field` | `TField` |

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

[src/ent/predicates/OutgoingEdgePointsToVC.ts:18](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/OutgoingEdgePointsToVC.ts#L18)
