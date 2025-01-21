[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / escapeLiteral

# Function: escapeLiteral()

> **escapeLiteral**(`literal`): `string`

Defined in: [src/pg/helpers/escapeLiteral.ts:15](https://github.com/clickup/ent-framework/blob/master/src/pg/helpers/escapeLiteral.ts#L15)

Builds a part of SQL query using ?-placeholders to prevent SQL Injection.
Everywhere where we want to accept a piece of SQL, we should instead accept a
Literal tuple.

The function converts a Literal tuple [fmt, ...args] into a string, escaping
the args and interpolating them into the format SQL where "?" is a
placeholder for the replacing value.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `literal` | [`Literal`](../type-aliases/Literal.md) |

## Returns

`string`
