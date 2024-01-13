[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / ShardOptions

# Interface: ShardOptions\<TClient\>

Options passed to Shard constructor.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](../classes/Client.md) |

## Properties

### locateClient

• **locateClient**: (`freshness`: typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica)) => `Promise`\<`TClient`\>

#### Type declaration

▸ (`freshness`): `Promise`\<`TClient`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `freshness` | typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica) |

##### Returns

`Promise`\<`TClient`\>

#### Defined in

[src/abstract/Shard.ts:21](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L21)

___

### onRunError

• **onRunError**: (`attempt`: `number`, `error`: `unknown`) => `Promise`\<``"retry"`` \| ``"throw"``\>

#### Type declaration

▸ (`attempt`, `error`): `Promise`\<``"retry"`` \| ``"throw"``\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `attempt` | `number` |
| `error` | `unknown` |

##### Returns

`Promise`\<``"retry"`` \| ``"throw"``\>

#### Defined in

[src/abstract/Shard.ts:24](https://github.com/clickup/ent-framework/blob/master/src/abstract/Shard.ts#L24)
