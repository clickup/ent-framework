[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Require

# Class: Require\<TInput\>

Defined in: [src/ent/rules/Require.ts:11](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Require.ts#L11)

Returns TOLERATE if the predicate succeeds, otherwise DENY.
- Used mostly for write permission checks.
- This rule may still throw an exception if it's a wild one (i.e. not derived
  from EntAccessError).

## Extends

- [`Rule`](Rule.md)\<`TInput`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` *extends* `object` |

## Constructors

### new Require()

> **new Require**\<`TInput`\>(`predicate`): [`Require`](Require.md)\<`TInput`\>

Defined in: [src/ent/rules/Rule.ts:43](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L43)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | [`Predicate`](../interfaces/Predicate.md)\<`TInput`\> \| (`vc`, `input`) => `Promise`\<`boolean`\> |

#### Returns

[`Require`](Require.md)\<`TInput`\>

#### Inherited from

[`Rule`](Rule.md).[`constructor`](Rule.md#constructors)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="_tag"></a> `_TAG` | `"Require"` |
| <a id="predicate-1"></a> `predicate` | [`Predicate`](../interfaces/Predicate.md)\<`TInput`\> |
| <a id="name"></a> `name` | `string` |

## Methods

### evaluate()

> **evaluate**(`vc`, `input`): `Promise`\<[`RuleResult`](../interfaces/RuleResult.md)\>

Defined in: [src/ent/rules/Require.ts:14](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Require.ts#L14)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`\<[`RuleResult`](../interfaces/RuleResult.md)\>

#### Overrides

[`Rule`](Rule.md).[`evaluate`](Rule.md#evaluate)
