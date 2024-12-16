[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / LocalCacheOptions

# Interface: LocalCacheOptions

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `dir` | `string` | Directory to store the cache in (auto-created). |
| `loggers` | `Pick`\<[`Loggers`](Loggers.md), `"swallowedErrorLogger"`\> | Loggers for e.g. swallowed errors. |
| `expirationMs?` | `number` | Max time (approximately) for an unread key to exist. |
| `ext?` | `string` | Extension of cache files (without dot). |
| `cleanupJitter?` | `number` | Jitter for cleanup runs. |
| `cleanupFirstRunDelayMs?` | `number` | How much time to wait till the very 1st cleanup run. The idea is that Node process may be short-lived, so the next cleanup run configured via cleanupRoundsPerExpiration may never happen, and we also need to cleanup in the very beginning of the object lifetime. |
| `cleanupRoundsPerExpiration?` | `number` | How many times per expirationMs interval should we run the cleanup. |
| `mtimeUpdatesOnReadPerExpiration?` | `number` | How often to update mtime on read operations. E.g. if this value is 10, then mtime will be updated not more than ~10 times within the expiration period (optimizing filesystem writes). |
