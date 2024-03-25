[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / ClientQueryLoggerProps

# Interface: ClientQueryLoggerProps

## Properties

### annotations

• **annotations**: [`QueryAnnotation`](QueryAnnotation.md)[]

#### Defined in

[src/abstract/Loggers.ts:20](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L20)

___

### op

• **op**: `string`

#### Defined in

[src/abstract/Loggers.ts:21](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L21)

___

### shard

• **shard**: `string`

#### Defined in

[src/abstract/Loggers.ts:22](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L22)

___

### table

• **table**: `string`

#### Defined in

[src/abstract/Loggers.ts:23](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L23)

___

### batchFactor

• **batchFactor**: `number`

#### Defined in

[src/abstract/Loggers.ts:24](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L24)

___

### msg

• **msg**: `string`

#### Defined in

[src/abstract/Loggers.ts:25](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L25)

___

### output

• **output**: `unknown`

#### Defined in

[src/abstract/Loggers.ts:26](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L26)

___

### elapsed

• **elapsed**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `total` | `number` |
| `acquire` | `number` |

#### Defined in

[src/abstract/Loggers.ts:27](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L27)

___

### connStats

• **connStats**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `queriesSent` | `number` |

#### Defined in

[src/abstract/Loggers.ts:31](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L31)

___

### poolStats

• **poolStats**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `totalConns` | `number` | Total number of connections in the pool. |
| `idleConns` | `number` | Connections not busy running a query. |
| `queuedReqs` | `number` | Once all idle connections are over, requests are queued waiting for a new available connection. This is the number of such queued requests. |

#### Defined in

[src/abstract/Loggers.ts:35](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L35)

___

### error

• **error**: `undefined` \| `string`

#### Defined in

[src/abstract/Loggers.ts:44](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L44)

___

### role

• **role**: [`ClientRole`](../modules.md#clientrole)

#### Defined in

[src/abstract/Loggers.ts:45](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L45)

___

### backend

• **backend**: `string`

#### Defined in

[src/abstract/Loggers.ts:46](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L46)

___

### address

• **address**: `string`

#### Defined in

[src/abstract/Loggers.ts:47](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L47)
