[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / True

# Class: True

Defined in: [src/ent/predicates/True.ts:7](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/True.ts#L7)

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
| <a id="name"></a> `name` | `string` |

## Methods

### check()

> **check**(`_vc`): `Promise`\<`boolean`\>

Defined in: [src/ent/predicates/True.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/True.ts#L10)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_vc` | [`VC`](VC.md) |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)
