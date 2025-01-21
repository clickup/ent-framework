[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ShardError

# Class: ShardError

Defined in: [src/abstract/ShardError.ts:5](https://github.com/clickup/ent-framework/blob/master/src/abstract/ShardError.ts#L5)

This non-retriable error is thrown when the system cannot detect the target
shard to work with (e.g. a null ID or a missing field or something else).

## Extends

- `Error`

## Extended by

- [`ShardIsNotDiscoverableError`](ShardIsNotDiscoverableError.md)

## Constructors

### new ShardError()

> **new ShardError**(`message`, `where`?): [`ShardError`](ShardError.md)

Defined in: [src/abstract/ShardError.ts:6](https://github.com/clickup/ent-framework/blob/master/src/abstract/ShardError.ts#L6)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `where`? | `string` |

#### Returns

[`ShardError`](ShardError.md)

#### Overrides

`Error.constructor`
