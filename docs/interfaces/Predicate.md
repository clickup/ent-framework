[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / Predicate

# Interface: Predicate\<TInput\>

A predicate evaluates against some input (typically a row) and returns true
or false (or throws which is considering the similar way as returning false).

I.e. Predicate is a "yes/no" logic. If it resolves to "no", then the
framework may disallow some Ent operation and include predicate object's
properties (like name or any other info) to the exception.

Also, some predicates try to use caches in vc to make the decision faster
based on the previously computed results. E.g. CanReadOutgoingEdge predicate
knows that it already returned true for some ID once, it returns true again
immediately. This saves us lots of database operations.

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` |

## Properties

| Property | Type |
| ------ | ------ |
| `name` | `string` |

## Methods

### check()

> **check**(`vc`, `input`): `Promise`\<`boolean`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](../classes/VC.md) |
| `input` | `TInput` |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/ent/predicates/Predicate.ts:19](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/Predicate.ts#L19)
