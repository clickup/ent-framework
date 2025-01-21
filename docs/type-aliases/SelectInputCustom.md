[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / SelectInputCustom

# Type Alias: SelectInputCustom

> **SelectInputCustom**: \{ `ctes`: [`Literal`](Literal.md)[]; `joins`: [`Literal`](Literal.md)[]; `from`: [`Literal`](Literal.md); `hints`: `Record`\<`string`, `string`\>; \} \| `undefined`

Defined in: [src/pg/PgQuerySelect.ts:34](https://github.com/clickup/ent-framework/blob/master/src/pg/PgQuerySelect.ts#L34)

This is mostly to do hacks in PostgreSQL queries. Not even exposed by Ent
framework, but can be used by PG-dependent code.
