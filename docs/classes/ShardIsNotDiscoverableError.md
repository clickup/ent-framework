[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ShardIsNotDiscoverableError

# Class: ShardIsNotDiscoverableError

Defined in: [src/abstract/ShardIsNotDiscoverableError.ts:10](https://github.com/clickup/ent-framework/blob/master/src/abstract/ShardIsNotDiscoverableError.ts#L10)

This non-retriable error is thrown when shardsDiscoverCache.cached() returns
no shard with the requested number.

## Extends

- [`ShardError`](ShardError.md)

## Constructors

### new ShardIsNotDiscoverableError()

> **new ShardIsNotDiscoverableError**(`shardNo`, `errors`, `islands`, `elapsed`): [`ShardIsNotDiscoverableError`](ShardIsNotDiscoverableError.md)

Defined in: [src/abstract/ShardIsNotDiscoverableError.ts:11](https://github.com/clickup/ent-framework/blob/master/src/abstract/ShardIsNotDiscoverableError.ts#L11)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `shardNo` | `number` |
| `errors` | [`SwallowedErrorLoggerProps`](../interfaces/SwallowedErrorLoggerProps.md)[] |
| `islands` | [`Island`](Island.md)\<[`Client`](Client.md)\>[] |
| `elapsed` | `number` |

#### Returns

[`ShardIsNotDiscoverableError`](ShardIsNotDiscoverableError.md)

#### Overrides

[`ShardError`](ShardError.md).[`constructor`](ShardError.md#constructors)
