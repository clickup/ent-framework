[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ValueRequired

# Type Alias: ValueRequired\<TSpec\>

> **ValueRequired**\<`TSpec`\>: `TSpec`\[`"type"`\] *extends* *typeof* `Number` ? `number` : `TSpec`\[`"type"`\] *extends* *typeof* `String` ? `string` : `TSpec`\[`"type"`\] *extends* *typeof* `Boolean` ? `boolean` : `TSpec`\[`"type"`\] *extends* *typeof* [`ID`](../variables/ID.md) ? `string` : `TSpec`\[`"type"`\] *extends* *typeof* `Date` ? `Date` : `TSpec`\[`"type"`\] *extends* `object` ? `TSpec`\[`"type"`\] *extends* `object` ? `TJSValue` : `never` : `never`

Defined in: [src/types.ts:151](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L151)

SpecType -> Value deduction (always deduces non-nullable type).

## Type Parameters

| Type Parameter |
| ------ |
| `TSpec` *extends* [`Spec`](Spec.md) |
