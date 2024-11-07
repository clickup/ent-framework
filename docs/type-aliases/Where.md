[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / Where

# Type Alias: Where\<TTable\>

> **Where**\<`TTable`\>: `object` & `object` & \{ \[K in Field\<TTable\>\]?: Value\<TTable\[K\]\> \| ReadonlyArray\<Value\<TTable\[K\]\>\> \| Object \| Object \| Object \| Object \| Object \| Object \| Object \}

Table -> { f: 10, [$or]: [ { f2: "a }, { f3: "b""} ], $literal: ["x=?", 1] }

## Type declaration

### $and?

> `optional` **$and**: `ReadonlyArray`\<[`Where`](Where.md)\<`TTable`\>\>

### $or?

> `optional` **$or**: `ReadonlyArray`\<[`Where`](Where.md)\<`TTable`\>\>

### $not?

> `optional` **$not**: [`Where`](Where.md)\<`TTable`\>

### $literal?

> `optional` **$literal**: [`Literal`](Literal.md)

### $shardOfID?

> `optional` **$shardOfID**: `string`

## Type declaration

### id?

> `optional` **id**: `TTable` *extends* `object` ? `unknown` : `string` \| `string`[]

## Type Parameters

| Type Parameter |
| ------ |
| `TTable` *extends* [`Table`](Table.md) |

## Defined in

[src/types.ts:270](https://github.com/clickup/ent-framework/blob/master/src/types.ts#L270)
