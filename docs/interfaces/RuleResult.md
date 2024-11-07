[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / RuleResult

# Interface: RuleResult

A full debug info about some Rule decision (which Rule produced this
decision, what was thrown etc.).

## Properties

| Property | Type |
| ------ | ------ |
| `decision` | [`RuleDecision`](../type-aliases/RuleDecision.md) |
| `rule` | [`Rule`](../classes/Rule.md)\<`object`\> |
| `cause` | `null` \| [`EntAccessError`](../classes/EntAccessError.md) |
