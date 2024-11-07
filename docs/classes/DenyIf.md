[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / DenyIf

# Class: DenyIf\<TInput\>

Returns DENY if the predicate succeeds, otherwise SKIP.
- Used mostly to early block some read/write access.
- EntAccessError exception will be treated as a DENY signal (so it will abort
  processing immediately).
- This rule may still throw an exception if the exception is a wild one (not
  derived from EntAccessError).

## Extends

- [`Rule`](Rule.md)\<`TInput`\>

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` *extends* `object` |

## Constructors

### new DenyIf()

> **new DenyIf**\<`TInput`\>(`predicate`): [`DenyIf`](DenyIf.md)\<`TInput`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | [`Predicate`](../interfaces/Predicate.md)\<`TInput`\> \| (`vc`, `input`) => `Promise`\<`boolean`\> |

#### Returns

[`DenyIf`](DenyIf.md)\<`TInput`\>

#### Inherited from

[`Rule`](Rule.md).[`constructor`](Rule.md#constructors)

#### Defined in

[src/ent/rules/Rule.ts:43](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L43)

## Properties

| Property | Type |
| ------ | ------ |
| `_TAG` | `"DenyIf"` |
| `predicate` | [`Predicate`](../interfaces/Predicate.md)\<`TInput`\> |
| `name` | `string` |

## Methods

### evaluate()

> **evaluate**(`vc`, `input`): `Promise`\<[`RuleResult`](../interfaces/RuleResult.md)\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`\<[`RuleResult`](../interfaces/RuleResult.md)\>

#### Overrides

[`Rule`](Rule.md).[`evaluate`](Rule.md#evaluate)

#### Defined in

[src/ent/rules/DenyIf.ts:17](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/DenyIf.ts#L17)
