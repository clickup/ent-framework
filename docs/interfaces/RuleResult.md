[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / RuleResult

# Interface: RuleResult

Defined in: [src/ent/rules/Rule.ts:15](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/Rule.ts#L15)

A full debug info about some Rule decision (which Rule produced this
decision, what was thrown etc.).

## Properties

| Property | Type |
| ------ | ------ |
| <a id="decision"></a> `decision` | [`RuleDecision`](../type-aliases/RuleDecision.md) |
| <a id="rule"></a> `rule` | [`Rule`](../classes/Rule.md)\<`object`\> |
| <a id="cause"></a> `cause` | `null` \| [`EntAccessError`](../classes/EntAccessError.md) |
