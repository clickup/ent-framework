[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / FuncToPredicate

# Class: FuncToPredicate\<TInput\>

Defined in: [src/ent/predicates/Predicate.ts:29](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Predicate.ts#L29)

Sometimes, instead of passing a well-known predicate like OutgoingEdgePointsToVC
or CanUpdateOutgoingEdge, we want to pass just a function which accepts a row
and returns true or false. This class represents a Predicate which delegates
its work to such a function. The name of the function becomes the name of the
predicate.

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`TInput`\>

## Constructors

### new FuncToPredicate()

> **new FuncToPredicate**\<`TInput`\>(`func`): [`FuncToPredicate`](FuncToPredicate.md)\<`TInput`\>

Defined in: [src/ent/predicates/Predicate.ts:32](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Predicate.ts#L32)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `func` | (`vc`, `input`) => `boolean` \| `Promise`\<`boolean`\> |

#### Returns

[`FuncToPredicate`](FuncToPredicate.md)\<`TInput`\>

## Properties

| Property | Type |
| ------ | ------ |
| <a id="name"></a> `name` | `string` |

## Methods

### check()

> **check**(`vc`, `input`): `Promise`\<`boolean`\>

Defined in: [src/ent/predicates/Predicate.ts:38](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Predicate.ts#L38)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)
