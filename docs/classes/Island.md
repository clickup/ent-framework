[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Island

# Class: Island<TClient\>

Island is 1 master + N replicas.
One island typically hosts multiple shards.

## Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md) |

## Constructors

### constructor

• **new Island**<`TClient`\>(`no`, `master`, `replicas`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TClient` | extends [`Client`](Client.md)<`TClient`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `no` | `number` |
| `master` | `TClient` |
| `replicas` | `TClient`[] |

#### Defined in

[packages/ent-framework/src/abstract/Cluster.ts:17](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Cluster.ts#L17)

## Properties

### master

• `Readonly` **master**: `TClient`

___

### no

• `Readonly` **no**: `number`

___

### replicas

• `Readonly` **replicas**: `TClient`[]
