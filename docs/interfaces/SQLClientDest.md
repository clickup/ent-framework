[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientDest

# Interface: SQLClientDest

## Properties

### name

• **name**: `string`

#### Defined in

[src/sql/SQLClientPool.ts:14](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L14)

___

### shards

• **shards**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `nameFormat` | `string` |
| `discoverQuery` | `string` |

#### Defined in

[src/sql/SQLClientPool.ts:15](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L15)

___

### isMaster

• **isMaster**: `boolean`

#### Defined in

[src/sql/SQLClientPool.ts:19](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L19)

___

### hints

• `Optional` **hints**: `Record`<`string`, `string`\>

#### Defined in

[src/sql/SQLClientPool.ts:20](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L20)

___

### batchDelayMs

• `Optional` **batchDelayMs**: `number` \| () => `number`

#### Defined in

[src/sql/SQLClientPool.ts:21](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L21)

___

### config

• **config**: `PoolConfig` & { `maxConnLifetimeMs?`: `number` ; `maxConnLifetimeJitter?`: `number` ; `maxReplicationLagMs?`: `number` ; `prewarmIntervalMs?`: `number` ; `prewarmQuery?`: `string` \| () => `string`  }

#### Defined in

[src/sql/SQLClientPool.ts:22](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L22)

___

### loggers

• **loggers**: [`Loggers`](Loggers.md)

#### Defined in

[src/sql/SQLClientPool.ts:29](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClientPool.ts#L29)
