[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / OutgoingEdgePointsToVC

# Class: OutgoingEdgePointsToVC\<TField\>

Defined in: [src/ent/predicates/OutgoingEdgePointsToVC.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/OutgoingEdgePointsToVC.ts#L9)

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

Defined in: [src/ent/predicates/OutgoingEdgePointsToVC.ts:14](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/OutgoingEdgePointsToVC.ts#L14)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | `TField` |

#### Returns

[`OutgoingEdgePointsToVC`](OutgoingEdgePointsToVC.md)\<`TField`\>

## Properties

| Property | Type |
| ------ | ------ |
| <a id="name"></a> `name` | `string` |
| <a id="field-1"></a> `field` | `TField` |

## Methods

### check()

> **check**(`vc`, `row`): `Promise`\<`boolean`\>

Defined in: [src/ent/predicates/OutgoingEdgePointsToVC.ts:18](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/OutgoingEdgePointsToVC.ts#L18)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | `Record`\<`TField`, `null` \| `string`\> |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)
