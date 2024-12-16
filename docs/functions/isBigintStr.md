[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / isBigintStr

# Function: isBigintStr()

> **isBigintStr**(`str`): `boolean`

It's hard to support PG bigint type in JS, so people use strings instead.
This function checks that a string can be passed to PG as a bigint.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

## Returns

`boolean`

## Defined in

[src/helpers/isBigintStr.ts:8](https://github.com/clickup/ent-framework/blob/master/src/helpers/isBigintStr.ts#L8)
