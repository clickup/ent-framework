[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Island

# Class: Island<TClient\>

Island is a collection of DB connections (represented as Clients) that
contains a single master server and any number of replicas.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

## Constructors

### constructor

• **new Island**<`TClient`\>(`master`, `replicas`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `master` | `TClient` |
| `replicas` | `TClient`[] |

#### Defined in

[src/abstract/Island.ts:9](https://github.com/clickup/rest-client/blob/master/src/abstract/Island.ts#L9)

## Properties

### master

• `Readonly` **master**: `TClient`

#### Defined in

[src/abstract/Island.ts:10](https://github.com/clickup/rest-client/blob/master/src/abstract/Island.ts#L10)

___

### replicas

• `Readonly` **replicas**: `TClient`[]

#### Defined in

[src/abstract/Island.ts:11](https://github.com/clickup/rest-client/blob/master/src/abstract/Island.ts#L11)

## Methods

### shardNos

▸ **shardNos**(): `Promise`<readonly `number`[]\>

Returns all Shards on the first available Client (master, then replicas).

#### Returns

`Promise`<readonly `number`[]\>

#### Defined in

[src/abstract/Island.ts:17](https://github.com/clickup/rest-client/blob/master/src/abstract/Island.ts#L17)
