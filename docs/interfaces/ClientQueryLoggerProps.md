[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ClientQueryLoggerProps

# Interface: ClientQueryLoggerProps

Defined in: [src/abstract/Loggers.ts:19](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L19)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="annotations"></a> `annotations` | [`QueryAnnotation`](QueryAnnotation.md)[] | - |
| <a id="op"></a> `op` | `string` | - |
| <a id="shard"></a> `shard` | `string` | - |
| <a id="table"></a> `table` | `string` | - |
| <a id="batchfactor"></a> `batchFactor` | `number` | - |
| <a id="msg"></a> `msg` | `string` | - |
| <a id="output"></a> `output` | `unknown` | - |
| <a id="elapsed"></a> `elapsed` | `object` | - |
| `elapsed.total` | `number` | - |
| `elapsed.acquire` | `number` | - |
| <a id="connstats"></a> `connStats` | `object` | - |
| `connStats.id` | `string` | - |
| `connStats.queriesSent` | `number` | - |
| <a id="poolstats"></a> `poolStats` | `object` | - |
| `poolStats.totalConns` | `number` | Total number of connections in the pool. |
| `poolStats.idleConns` | `number` | Connections not busy running a query. |
| `poolStats.queuedReqs` | `number` | Once all idle connections are over, requests are queued waiting for a new available connection. This is the number of such queued requests. |
| <a id="error"></a> `error` | `undefined` \| `string` | - |
| <a id="role"></a> `role` | [`ClientRole`](../type-aliases/ClientRole.md) | - |
| <a id="backend"></a> `backend` | `string` | - |
| <a id="address"></a> `address` | `string` | - |
