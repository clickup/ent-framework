[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / ShardError

# Class: ShardError

This non-retriable error is thrown when the system cannot detect the target
shard to work with (e.g. a null ID or a missing field or something else).

## Extends

- `Error`

## Constructors

### new ShardError()

> **new ShardError**(`message`, `where`?): [`ShardError`](ShardError.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `where`? | `string` |

#### Returns

[`ShardError`](ShardError.md)

#### Overrides

`Error.constructor`

#### Defined in

[src/abstract/ShardError.ts:6](https://github.com/clickup/ent-framework/blob/master/src/abstract/ShardError.ts#L6)
