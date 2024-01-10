[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Rule

# Class: Rule<TInput\>

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

## Type parameters

| Name |
| :------ |
| `TInput` |

## Hierarchy

- **`Rule`**

  ↳ [`AllowIf`](AllowIf.md)

  ↳ [`DenyIf`](DenyIf.md)

  ↳ [`Require`](Require.md)

## Constructors

### constructor

• **new Rule**<`TInput`\>(`predicate`)

#### Type parameters

| Name |
| :------ |
| `TInput` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | [`Predicate`](../interfaces/Predicate.md)<`TInput`\> \| (`vc`: [`VC`](VC.md), `input`: `TInput`) => `Promise`<`boolean`\> |

#### Defined in

[src/ent/rules/Rule.ts:48](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L48)

## Properties

### predicate

• `Readonly` **predicate**: [`Predicate`](../interfaces/Predicate.md)<`TInput`\>

#### Defined in

[src/ent/rules/Rule.ts:43](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L43)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[src/ent/rules/Rule.ts:44](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L44)

## Methods

### evaluate

▸ `Abstract` **evaluate**(`vc`, `input`): `Promise`<[`RuleResult`](../interfaces/RuleResult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`<[`RuleResult`](../interfaces/RuleResult.md)\>

#### Defined in

[src/ent/rules/Rule.ts:46](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L46)
