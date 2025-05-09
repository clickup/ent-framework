[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ClientOptions

# Interface: ClientOptions

Defined in: [src/abstract/Client.ts:18](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L18)

Options for Client constructor.

## Extended by

- [`PgClientOptions`](PgClientOptions.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="name"></a> `name` | `string` | Name of the Client; used for logging. |
| <a id="shardnamer"></a> `shardNamer?` | `null` \| [`ShardNamer`](../classes/ShardNamer.md) | Info on how to build/parse Shard names. If not set, then Cluster injects its own ShardNamer here right after creating a Client instance. |
| <a id="loggers"></a> `loggers?` | `null` \| [`Loggers`](Loggers.md) | Loggers to be called at different stages. Client code calls into them. Also, Cluster injects its own loggers here, in addition to the provided ones (if any). |
| <a id="batchdelayms"></a> `batchDelayMs?` | `MaybeCallable`\<`number`\> | If passed, there will be an artificial queries accumulation delay while batching the requests. Default is 0 (turned off). Passed to Batcher#batchDelayMs. |
