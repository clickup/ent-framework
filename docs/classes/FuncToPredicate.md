[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / FuncToPredicate

# Class: FuncToPredicate<TInput\>

Sometimes, instead of passing a well-known predicate like OutgoingEdgePointsToVC
or CanUpdateOutgoingEdge, we want to pass just a function which accepts a row
and returns true or false. This class represents a Predicate which delegates
its work to such a function. The name of the function becomes the name of the
predicate.

## Type parameters

| Name |
| :------ |
| `TInput` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)<`TInput`\>

## Constructors

### constructor

• **new FuncToPredicate**<`TInput`\>(`func`)

#### Type parameters

| Name |
| :------ |
| `TInput` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `func` | (`vc`: [`VC`](VC.md), `input`: `TInput`) => `Promise`<`boolean`\> |

#### Defined in

[src/ent/predicates/Predicate.ts:32](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Predicate.ts#L32)

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[src/ent/predicates/Predicate.ts:30](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Predicate.ts#L30)

## Methods

### check

▸ **check**(`vc`, `input`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/Predicate.ts:34](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Predicate.ts#L34)
