[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Literal

# Type Alias: Literal

> **Literal**: (`string` \| `number` \| `boolean` \| `Date` \| `null` \| (`string` \| `number` \| `boolean` \| `Date` \| `null`)[])[]

Defined in: [src/types.ts:14](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L14)

Literal operation with placeholders. We don't use a tuple type here (like
`[string, ...T[]]`), because it would force us to use `as const` everywhere,
which we don't want to do.
