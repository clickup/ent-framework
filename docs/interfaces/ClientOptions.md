[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / ClientOptions

# Interface: ClientOptions

Options for Client constructor.

## Extended by

- [`PgClientOptions`](PgClientOptions.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | Name of the Client; used for logging. |
| `loggers?` | `null` \| [`Loggers`](Loggers.md) | Loggers to be called at different stages. |
| `batchDelayMs?` | `MaybeCallable`\<`number`\> | If passed, there will be an artificial queries accumulation delay while batching the requests. Default is 0 (turned off). Passed to Batcher#batchDelayMs. |
