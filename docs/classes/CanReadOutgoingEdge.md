[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / CanReadOutgoingEdge

# Class: CanReadOutgoingEdge\<TField\>

Checks that an ent which a field is pointing to is readable:

EntOur[company_id] ---> EntCompany[id]

This predicate delegates the readability permission check for the current ent
to another ent with ID equals to the value of our ent's field.

- field = user_id in the above example
- toEntClass = EntCompany in the above example

## Type Parameters

| Type Parameter |
| ------ |
| `TField` *extends* `string` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`Record`\<`TField`, `string` \| `null`\>\>

## Constructors

### new CanReadOutgoingEdge()

> **new CanReadOutgoingEdge**\<`TField`\>(`field`, `toEntClass`): [`CanReadOutgoingEdge`](CanReadOutgoingEdge.md)\<`TField`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | `TField` |
| `toEntClass` | [`EntClass`](../interfaces/EntClass.md) |

#### Returns

[`CanReadOutgoingEdge`](CanReadOutgoingEdge.md)\<`TField`\>

#### Defined in

[src/ent/predicates/CanReadOutgoingEdge.ts:23](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanReadOutgoingEdge.ts#L23)

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

[src/ent/predicates/CanReadOutgoingEdge.ts:30](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanReadOutgoingEdge.ts#L30)
