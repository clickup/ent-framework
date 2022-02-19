[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / RuleResult

# Interface: RuleResult

A full debug info about some Rule decision (which Rule produced this
decision, what was thrown etc.).

## Properties

### cause

• **cause**: ``null`` \| [`EntAccessError`](../classes/EntAccessError.md)

#### Defined in

[packages/ent-framework/src/ent/rules/Rule.ts:24](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/rules/Rule.ts#L24)

___

### decision

• **decision**: [`RuleDecision`](../enums/RuleDecision.md)

#### Defined in

[packages/ent-framework/src/ent/rules/Rule.ts:22](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/rules/Rule.ts#L22)

___

### rule

• **rule**: [`Rule`](../classes/Rule.md)<`object`\>

#### Defined in

[packages/ent-framework/src/ent/rules/Rule.ts:23](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/rules/Rule.ts#L23)
