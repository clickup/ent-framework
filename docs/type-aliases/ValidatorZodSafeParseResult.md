[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ValidatorZodSafeParseResult

# Type Alias: ValidatorZodSafeParseResult

> **ValidatorZodSafeParseResult**: \{ `success`: `true`; `error`: `undefined`; \} \| \{ `success`: `false`; `error`: \{ `issues`: `ReadonlyArray`\<\{ `message`: `string`; `path`: readonly `PropertyKey`[]; \}\>; \}; \}

Defined in: src/ent/predicates/AbstractIs.ts:25

Result of Zod safeParse() calls.
