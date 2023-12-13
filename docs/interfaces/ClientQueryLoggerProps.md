[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / ClientQueryLoggerProps

# Interface: ClientQueryLoggerProps

## Properties

### annotations

• **annotations**: [`QueryAnnotation`](QueryAnnotation.md)[]

#### Defined in

[src/abstract/Loggers.ts:12](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L12)

___

### connID

• **connID**: `string`

#### Defined in

[src/abstract/Loggers.ts:13](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L13)

___

### op

• **op**: `string`

#### Defined in

[src/abstract/Loggers.ts:14](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L14)

___

### shard

• **shard**: `string`

#### Defined in

[src/abstract/Loggers.ts:15](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L15)

___

### table

• **table**: `string`

#### Defined in

[src/abstract/Loggers.ts:16](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L16)

___

### batchFactor

• **batchFactor**: `number`

#### Defined in

[src/abstract/Loggers.ts:17](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L17)

___

### msg

• **msg**: `string`

#### Defined in

[src/abstract/Loggers.ts:18](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L18)

___

### output

• **output**: `any`

#### Defined in

[src/abstract/Loggers.ts:19](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L19)

___

### elapsed

• **elapsed**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `total` | `number` |
| `acquire` | `number` |

#### Defined in

[src/abstract/Loggers.ts:20](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L20)

___

### poolStats

• **poolStats**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `totalCount` | `number` |
| `waitingCount` | `number` |
| `idleCount` | `number` |

#### Defined in

[src/abstract/Loggers.ts:24](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L24)

___

### error

• **error**: `undefined` \| `string`

#### Defined in

[src/abstract/Loggers.ts:29](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L29)

___

### isMaster

• **isMaster**: `boolean`

#### Defined in

[src/abstract/Loggers.ts:30](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L30)

___

### backend

• **backend**: `string`

#### Defined in

[src/abstract/Loggers.ts:31](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L31)
