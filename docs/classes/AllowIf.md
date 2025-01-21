[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / AllowIf

# Class: AllowIf\<TInput\>

Defined in: [src/ent/rules/AllowIf.ts:12](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/AllowIf.ts#L12)

Returns ALLOW if the predicate succeeds, otherwise SKIP.
- Used mostly for read permission checks.
- This rule may still throw an exception if the exception is a wild one (not
  derived from EntAccessError).

## Extends

- [`Rule`](Rule.md)\<`TInput`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` *extends* `object` |

## Constructors

### new AllowIf()

> **new AllowIf**\<`TInput`\>(`predicate`): [`AllowIf`](AllowIf.md)\<`TInput`\>

Defined in: [src/ent/rules/Rule.ts:43](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L43)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | [`Predicate`](../interfaces/Predicate.md)\<`TInput`\> \| (`vc`, `input`) => `Promise`\<`boolean`\> |

#### Returns

[`AllowIf`](AllowIf.md)\<`TInput`\>

#### Inherited from

[`Rule`](Rule.md).[`constructor`](Rule.md#constructors)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="_tag"></a> `_TAG` | `"AllowIf"` |
| <a id="predicate-1"></a> `predicate` | [`Predicate`](../interfaces/Predicate.md)\<`TInput`\> |
| <a id="name"></a> `name` | `string` |

## Methods

### evaluate()

> **evaluate**(`vc`, `input`): `Promise`\<[`RuleResult`](../interfaces/RuleResult.md)\>

Defined in: [src/ent/rules/AllowIf.ts:15](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/AllowIf.ts#L15)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`\<[`RuleResult`](../interfaces/RuleResult.md)\>

#### Overrides

[`Rule`](Rule.md).[`evaluate`](Rule.md#evaluate)
