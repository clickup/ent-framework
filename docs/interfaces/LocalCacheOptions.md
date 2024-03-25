[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / LocalCacheOptions

# Interface: LocalCacheOptions

## Properties

### dir

• **dir**: `string`

Directory to store the cache in (auto-created).

#### Defined in

[src/abstract/LocalCache.ts:10](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L10)

___

### loggers

• **loggers**: `Pick`\<[`Loggers`](Loggers.md), ``"swallowedErrorLogger"``\>

Loggers for e.g. swallowed errors.

#### Defined in

[src/abstract/LocalCache.ts:12](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L12)

___

### expirationMs

• `Optional` **expirationMs**: `number`

Max time (approximately) for an unread key to exist.

#### Defined in

[src/abstract/LocalCache.ts:14](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L14)

___

### ext

• `Optional` **ext**: `string`

Extension of cache files (without dot).

#### Defined in

[src/abstract/LocalCache.ts:16](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L16)

___

### cleanupJitter

• `Optional` **cleanupJitter**: `number`

Jitter for cleanup runs.

#### Defined in

[src/abstract/LocalCache.ts:18](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L18)

___

### cleanupFirstRunDelayMs

• `Optional` **cleanupFirstRunDelayMs**: `number`

How much time to wait till the very 1st cleanup run. The idea is that Node
process may be short-lived, so the next cleanup run configured via
cleanupRoundsPerExpiration may never happen, and we also need to cleanup in
the very beginning of the object lifetime.

#### Defined in

[src/abstract/LocalCache.ts:23](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L23)

___

### cleanupRoundsPerExpiration

• `Optional` **cleanupRoundsPerExpiration**: `number`

How many times per expirationMs interval should we run the cleanup.

#### Defined in

[src/abstract/LocalCache.ts:25](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L25)

___

### mtimeUpdatesOnReadPerExpiration

• `Optional` **mtimeUpdatesOnReadPerExpiration**: `number`

How often to update mtime on read operations. E.g. if this value is 10,
then mtime will be updated not more than ~10 times within the expiration
period (optimizing filesystem writes).

#### Defined in

[src/abstract/LocalCache.ts:29](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L29)
