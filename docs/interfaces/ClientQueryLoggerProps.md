[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / ClientQueryLoggerProps

# Interface: ClientQueryLoggerProps

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `annotations` | [`QueryAnnotation`](QueryAnnotation.md)[] | - |
| `op` | `string` | - |
| `shard` | `string` | - |
| `table` | `string` | - |
| `batchFactor` | `number` | - |
| `msg` | `string` | - |
| `output` | `unknown` | - |
| `elapsed` | `object` | - |
| `elapsed.total` | `number` | - |
| `elapsed.acquire` | `number` | - |
| `connStats` | `object` | - |
| `connStats.id` | `string` | - |
| `connStats.queriesSent` | `number` | - |
| `poolStats` | `object` | - |
| `poolStats.totalConns` | `number` | Total number of connections in the pool. |
| `poolStats.idleConns` | `number` | Connections not busy running a query. |
| `poolStats.queuedReqs` | `number` | Once all idle connections are over, requests are queued waiting for a new available connection. This is the number of such queued requests. |
| `error` | `undefined` \| `string` | - |
| `role` | [`ClientRole`](../type-aliases/ClientRole.md) | - |
| `backend` | `string` | - |
| `address` | `string` | - |
