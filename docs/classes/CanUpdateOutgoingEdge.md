[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / CanUpdateOutgoingEdge

# Class: CanUpdateOutgoingEdge\<TField\>

Defined in: [src/ent/predicates/CanUpdateOutgoingEdge.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanUpdateOutgoingEdge.ts#L10)

Checks that an Ent available via a field is updatable. See
CanReadOutgoingEdge comments for more details.

## Type Parameters

| Type Parameter |
| ------ |
| `TField` *extends* `string` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`Record`\<`TField`, `string` \| `null`\>\>

## Constructors

### new CanUpdateOutgoingEdge()

> **new CanUpdateOutgoingEdge**\<`TField`\>(`field`, `toEntClass`): [`CanUpdateOutgoingEdge`](CanUpdateOutgoingEdge.md)\<`TField`\>

Defined in: [src/ent/predicates/CanUpdateOutgoingEdge.ts:15](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanUpdateOutgoingEdge.ts#L15)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `field` | `TField` |
| `toEntClass` | [`EntClass`](../interfaces/EntClass.md) |

#### Returns

[`CanUpdateOutgoingEdge`](CanUpdateOutgoingEdge.md)\<`TField`\>

## Properties

| Property | Type |
| ------ | ------ |
| <a id="name"></a> `name` | `string` |
| <a id="field-1"></a> `field` | `TField` |
| <a id="toentclass-1"></a> `toEntClass` | [`EntClass`](../interfaces/EntClass.md) |

## Methods

### check()

> **check**(`vc`, `row`): `Promise`\<`boolean`\>

Defined in: [src/ent/predicates/CanUpdateOutgoingEdge.ts:22](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/CanUpdateOutgoingEdge.ts#L22)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `row` | `Record`\<`TField`, `null` \| `string`\> |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)
