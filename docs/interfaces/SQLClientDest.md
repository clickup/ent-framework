[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientDest

# Interface: SQLClientDest

## Properties

### config

• **config**: `PoolConfig` & { `maxConnLifetimeJitter?`: `number` ; `maxConnLifetimeMs?`: `number` ; `maxReplicationLagMs?`: `number` ; `prewarmIntervalMs?`: `number`  }

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:26](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L26)

___

### isMaster

• **isMaster**: `boolean`

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:25](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L25)

___

### name

• **name**: `string`

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:20](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L20)

___

### shards

• **shards**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `discoverQuery` | `string` |
| `nameFormat` | `string` |

#### Defined in

[packages/ent-framework/src/sql/SQLClientPool.ts:21](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/sql/SQLClientPool.ts#L21)
