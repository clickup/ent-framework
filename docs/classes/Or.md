[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / Or

# Class: Or\<TInput\>

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

#### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`predicates` | readonly ([`Predicate`](../interfaces/Predicate.md)\<`TInput`\> \| (`vc`, `input`) => `Promise`\<`boolean`\>)[] |

#### Returns

[`Or`](Or.md)\<`TInput`\>

#### Defined in

[src/ent/predicates/Or.ts:14](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Or.ts#L14)

## Properties

| Property | Type |
| ------ | ------ |
| `name` | `string` |
| `predicates` | readonly [`Predicate`](../interfaces/Predicate.md)\<`TInput`\>[] |

## Methods

### check()

> **check**(`vc`, `input`): `Promise`\<`boolean`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/Or.ts:26](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Or.ts#L26)
