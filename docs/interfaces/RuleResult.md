[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / RuleResult

# Interface: RuleResult

A full debug info about some Rule decision (which Rule produced this
decision, what was thrown etc.).

## Properties

### decision

• **decision**: [`RuleDecision`](../enums/RuleDecision.md)

#### Defined in

[src/ent/rules/Rule.ts:21](https://github.com/clickup/rest-client/blob/master/src/ent/rules/Rule.ts#L21)

___

### rule

• **rule**: [`Rule`](../classes/Rule.md)<`object`\>

#### Defined in

[src/ent/rules/Rule.ts:22](https://github.com/clickup/rest-client/blob/master/src/ent/rules/Rule.ts#L22)

___

### cause

• **cause**: ``null`` \| [`EntAccessError`](../classes/EntAccessError.md)

#### Defined in

[src/ent/rules/Rule.ts:23](https://github.com/clickup/rest-client/blob/master/src/ent/rules/Rule.ts#L23)
