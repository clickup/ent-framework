[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Or

# Class: Or\<TInput\>

Checks that at least one of the children predicates succeed.

## Type parameters

| Name |
| :------ |
| `TInput` |

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`TInput`\>

## Constructors

### constructor

• **new Or**\<`TInput`\>(`...predicates`): [`Or`](Or.md)\<`TInput`\>

#### Type parameters

| Name |
| :------ |
| `TInput` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...predicates` | readonly ([`Predicate`](../interfaces/Predicate.md)\<`TInput`\> \| (`vc`: [`VC`](VC.md), `input`: `TInput`) => `Promise`\<`boolean`\>)[] |

#### Returns

[`Or`](Or.md)\<`TInput`\>

#### Defined in

[src/ent/predicates/Or.ts:14](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Or.ts#L14)

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[src/ent/predicates/Or.ts:11](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Or.ts#L11)

___

### predicates

• `Readonly` **predicates**: readonly [`Predicate`](../interfaces/Predicate.md)\<`TInput`\>[]

#### Defined in

[src/ent/predicates/Or.ts:12](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Or.ts#L12)

## Methods

### check

▸ **check**(`vc`, `input`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/Or.ts:26](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Or.ts#L26)
