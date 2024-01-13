[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / ClientQueryLoggerProps

# Interface: ClientQueryLoggerProps

## Properties

### annotations

• **annotations**: [`QueryAnnotation`](QueryAnnotation.md)[]

#### Defined in

[src/abstract/Loggers.ts:11](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L11)

___

### connID

• **connID**: `string`

#### Defined in

[src/abstract/Loggers.ts:12](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L12)

___

### op

• **op**: `string`

#### Defined in

[src/abstract/Loggers.ts:13](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L13)

___

### shard

• **shard**: `string`

#### Defined in

[src/abstract/Loggers.ts:14](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L14)

___

### table

• **table**: `string`

#### Defined in

[src/abstract/Loggers.ts:15](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L15)

___

### batchFactor

• **batchFactor**: `number`

#### Defined in

[src/abstract/Loggers.ts:16](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L16)

___

### msg

• **msg**: `string`

#### Defined in

[src/abstract/Loggers.ts:17](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L17)

___

### output

• **output**: `unknown`

#### Defined in

[src/abstract/Loggers.ts:18](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L18)

___

### elapsed

• **elapsed**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `total` | `number` |
| `acquire` | `number` |

#### Defined in

[src/abstract/Loggers.ts:19](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L19)

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

[src/abstract/Loggers.ts:23](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L23)

___

### error

• **error**: `undefined` \| `string`

#### Defined in

[src/abstract/Loggers.ts:28](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L28)

___

### isMaster

• **isMaster**: `boolean`

#### Defined in

[src/abstract/Loggers.ts:29](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L29)

___

### backend

• **backend**: `string`

#### Defined in

[src/abstract/Loggers.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L30)
