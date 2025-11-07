[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / LocalCacheOptions

# Interface: LocalCacheOptions

Defined in: [src/abstract/LocalCache.ts:8](https://github.com/clickup/ent-framework/blob/master/src/abstract/LocalCache.ts#L8)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="dir"></a> `dir` | `string` | Directory to store the cache in (auto-created). |
| <a id="loggers"></a> `loggers` | `Pick`\<[`Loggers`](Loggers.md)\<`any`\>, `"swallowedErrorLogger"`\> | Loggers for e.g. swallowed errors. |
| <a id="expirationms"></a> `expirationMs?` | `number` | Max time (approximately) for an unread key to exist. |
| <a id="ext"></a> `ext?` | `string` | Extension of cache files (without dot). |
| <a id="cleanupjitter"></a> `cleanupJitter?` | `number` | Jitter for cleanup runs. |
| <a id="cleanupfirstrundelayms"></a> `cleanupFirstRunDelayMs?` | `number` | How much time to wait till the very 1st cleanup run. The idea is that Node process may be short-lived, so the next cleanup run configured via cleanupRoundsPerExpiration may never happen, and we also need to cleanup in the very beginning of the object lifetime. |
| <a id="cleanuproundsperexpiration"></a> `cleanupRoundsPerExpiration?` | `number` | How many times per expirationMs interval should we run the cleanup. |
| <a id="mtimeupdatesonreadperexpiration"></a> `mtimeUpdatesOnReadPerExpiration?` | `number` | How often to update mtime on read operations. E.g. if this value is 10, then mtime will be updated not more than ~10 times within the expiration period (optimizing filesystem writes). |
