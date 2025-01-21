[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / evaluate

# Function: evaluate()

> **evaluate**\<`TInput`\>(`vc`, `input`, `rules`, `fashion`): `Promise`\<\{ `allow`: `boolean`; `results`: [`RuleResult`](../interfaces/RuleResult.md)[]; `cause`: `string`; \}\>

Defined in: [src/ent/rules/evaluate.ts:49](https://github.com/clickup/ent-framework/blob/master/src/ent/rules/evaluate.ts#L49)

This is a hearth of permissions checking, a machine which evaluates the rules
chain from top to bottom (one after another) and makes the decision based on
the following logic:
- ALLOW immediately allows the chain, the rest of the rules are not checked.
  It's an eager allowance.
- DENY immediately denies the chain, the rest of the rules are not checked.
  It's an eager denial.
- TOLERATE delegates the decision to the next rules; if it's the last
  decision in the chain, then allows the chain. I.e. it's like an allowance,
  but only if everyone else is tolerant.
- SKIP also delegates the decision to the next rules, but if it's the last
  rule in the chain (i.e. nothing to skip to anymore), denies the chain. I.e.
  it's "I don't vote here, please ask others".
- An empty chain is always denied.

Having TOLERATE decision may sound superfluous, but unfortunately it's not.
The TOLERATE enables usage of the same machinery for both read-like checks
(where we typically want ANY of the rules to be okay with the row) and for
write-like checks (where we typically want ALL rules to be okay with the
row). Having the same logic for everything simplifies the code.

If parallel argument is true, all the rules are run at once in concurrent
promises before the machine starts. This doesn't affect the final result,
just speeds up processing if we know that there is a high chance that most of
the rules will likely return TOLERATE and we'll anyway need to evaluate all
of them (e.g. most of the rules are Require, like in write operations). As
opposed, for read operation, there is a high chance for the first rule (which
is often AllowIf) to succeed, so we evaluate the rules sequentially, not in
parallel (to minimize the number of DB queries).

Example of a chain (the order of rules always matters!):
- new Require(new OutgoingEdgePointsToVC("user_id"))
- new Require(new CanReadOutgoingEdge("post_id", EntPost))

Example of a chain:
- new AllowIf(new OutgoingEdgePointsToVC("user_id"))
- new AllowIf(new CanReadOutgoingEdge("post_id", EntPost))

Example of a chain:
- new DenyIf(new UserIsPendingApproval())
- new AllowIf(new OutgoingEdgePointsToVC("user_id"))

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` *extends* `object` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | `TInput` |
| `rules` | [`Rule`](../classes/Rule.md)\<`TInput`\>[] |
| `fashion` | `"parallel"` \| `"sequential"` |

## Returns

`Promise`\<\{ `allow`: `boolean`; `results`: [`RuleResult`](../interfaces/RuleResult.md)[]; `cause`: `string`; \}\>
