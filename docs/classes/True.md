[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / True

# Class: True

Always passes; used for e.g. globally accessed objects.

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`never`\>

## Constructors

### new True()

> **new True**(): [`True`](True.md)

#### Returns

[`True`](True.md)

## Properties

| Property | Type |
| ------ | ------ |
| `name` | `string` |

## Methods

### check()

> **check**(`_vc`): `Promise`\<`boolean`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_vc` | [`VC`](VC.md) |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/True.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/True.ts#L10)
