[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / ShardOptions

# Interface: ShardOptions<TClient\>

Options passed to Shard constructor.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](../classes/Client.md) |

## Properties

### locateClient

• **locateClient**: (`freshness`: typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica)) => `Promise`<`TClient`\>

#### Type declaration

▸ (`freshness`): `Promise`<`TClient`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `freshness` | typeof [`MASTER`](../modules.md#master) \| typeof [`STALE_REPLICA`](../modules.md#stale_replica) |

##### Returns

`Promise`<`TClient`\>

#### Defined in

[src/abstract/Shard.ts:20](https://github.com/clickup/rest-client/blob/master/src/abstract/Shard.ts#L20)

___

### onRunError

• **onRunError**: (`attempt`: `number`, `error`: `unknown`) => `Promise`<``"retry"`` \| ``"throw"``\>

#### Type declaration

▸ (`attempt`, `error`): `Promise`<``"retry"`` \| ``"throw"``\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `attempt` | `number` |
| `error` | `unknown` |

##### Returns

`Promise`<``"retry"`` \| ``"throw"``\>

#### Defined in

[src/abstract/Shard.ts:23](https://github.com/clickup/rest-client/blob/master/src/abstract/Shard.ts#L23)
