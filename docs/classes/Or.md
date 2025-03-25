[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Or

# Class: Or\<TInput\>

Defined in: [src/ent/predicates/Or.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Or.ts#L10)

Checks that at least one of the children predicates succeed.

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`TInput`\>

## Constructors

### new Or()

> **new Or**\<`TInput`\>(...`predicates`): [`Or`](Or.md)\<`TInput`\>

Defined in: [src/ent/predicates/Or.ts:14](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Or.ts#L14)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`predicates` | readonly ([`Predicate`](../interfaces/Predicate.md)\<`TInput`\> \| (`vc`, `input`) => `boolean` \| `Promise`\<`boolean`\>)[] |

#### Returns

[`Or`](Or.md)\<`TInput`\>

## Properties

| Property | Type |
| ------ | ------ |
| <a id="name"></a> `name` | `string` |
| <a id="predicates-1"></a> `predicates` | readonly [`Predicate`](../interfaces/Predicate.md)\<`TInput`\>[] |

## Methods

### check()

> **check**(`vc`, `input`): `Promise`\<`boolean`\>

Defined in: [src/ent/predicates/Or.ts:27](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Or.ts#L27)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)
