[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / ShardAffinity

# Type Alias: ShardAffinity\<TField, TF\>

> **ShardAffinity**\<`TField`, `TF`\>: *typeof* [`GLOBAL_SHARD`](../variables/GLOBAL_SHARD.md) \| `TField` *extends* *typeof* [`ID`](../variables/ID.md) ? readonly `TF`[] : readonly [`TF`, `...TF[]`]

Defines Ent Shard collocation to some Ent's field when this Ent is inserted.
- The Shard can always be Shard 0 ("global Shard"), be inferred based on the
  value in other Ent field during the insertion ("colocation"), or, in case
  colocation inference didn't succeed, be chosen pseudo-randomly at insertion
  time ("random Shard").
- E.g. a random Shard can also be chosen in case an empty array is passed to
  Shard affinity (like "always fallback"), or when a field's value points to
  a global Shard.
- Passing ID to ShardAffinity is prohibited by TS.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TField` *extends* `string` | - |
| `TF` | `Exclude`\<`TField`, *typeof* [`ID`](../variables/ID.md)\> |

## Defined in

[src/ent/ShardAffinity.ts:19](https://github.com/clickup/ent-framework/blob/master/src/ent/ShardAffinity.ts#L19)
