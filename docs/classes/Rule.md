[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Rule

# Class: `abstract` Rule\<TInput\>

Defined in: [src/ent/rules/Rule.ts:37](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L37)

A base class which can e.g. accept not only a predicate, but also a plain JS
lambda function as a predicate. Also has a logic of "glueing" the rule name
with the predicate name.

Each Rule must either:
- throw (or return DENY) if it disallows access immediately,
- return ALLOW if the access is granted (so no other rules will run),
- return TOLERATE if it's okay with the row, but wants others' votes too,
- or return SKIP to fully delegate the decision to the next rule.

See more comments in rules.ts.

Each rule carries a predicate which it calls and then decides, how to
interpret the result.

## Extended by

- [`AllowIf`](AllowIf.md)
- [`DenyIf`](DenyIf.md)
- [`Require`](Require.md)

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` |

## Constructors

### new Rule()

> **new Rule**\<`TInput`\>(`predicate`): [`Rule`](Rule.md)\<`TInput`\>

Defined in: [src/ent/rules/Rule.ts:43](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L43)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | [`Predicate`](../interfaces/Predicate.md)\<`TInput`\> \| (`vc`, `input`) => `Promise`\<`boolean`\> |

#### Returns

[`Rule`](Rule.md)\<`TInput`\>

## Properties

| Property | Type |
| ------ | ------ |
| <a id="predicate-1"></a> `predicate` | [`Predicate`](../interfaces/Predicate.md)\<`TInput`\> |
| <a id="name"></a> `name` | `string` |

## Methods

### evaluate()

> `abstract` **evaluate**(`vc`, `input`): `Promise`\<[`RuleResult`](../interfaces/RuleResult.md)\>

Defined in: [src/ent/rules/Rule.ts:41](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L41)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`\<[`RuleResult`](../interfaces/RuleResult.md)\>
