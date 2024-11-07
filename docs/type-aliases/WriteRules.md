[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / WriteRules

# Type Alias: WriteRules\<TInput\>

> **WriteRules**\<`TInput`\>: [] \| [[`Require`](../classes/Require.md)\<`TInput`\>, `...Require<TInput>[]`] \| [[`LoadRule`](LoadRule.md)\<`TInput`\>, [`Require`](../classes/Require.md)\<`TInput`\>, `...Require<TInput>[]`] \| [[`LoadRule`](LoadRule.md)\<`TInput`\>, [`LoadRule`](LoadRule.md)\<`TInput`\>, [`Require`](../classes/Require.md)\<`TInput`\>, `...Require<TInput>[]`] \| [[`LoadRule`](LoadRule.md)\<`TInput`\>, [`LoadRule`](LoadRule.md)\<`TInput`\>, [`LoadRule`](LoadRule.md)\<`TInput`\>, [`Require`](../classes/Require.md)\<`TInput`\>, `...Require<TInput>[]`] \| [[`LoadRule`](LoadRule.md)\<`TInput`\>, [`LoadRule`](LoadRule.md)\<`TInput`\>, [`LoadRule`](LoadRule.md)\<`TInput`\>, [`LoadRule`](LoadRule.md)\<`TInput`\>, [`Require`](../classes/Require.md)\<`TInput`\>, `...Require<TInput>[]`]

For safety, we enforce all Require rules to be in the end of the
insert/update/delete privacy list, and have at least one of them. In
TypeScript, it's not possible to create [...L[], R, ...R[]] type
(double-variadic) when both L[] and R[] are open-ended (i.e. tuples with
unknown length), so we have to brute-force.

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` *extends* `object` |

## Defined in

[src/ent/Validation.ts:33](https://github.com/clickup/ent-framework/blob/master/src/ent/Validation.ts#L33)
