[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / ClientOptions

# Interface: ClientOptions

Options for Client constructor.

## Hierarchy

- **`ClientOptions`**

  ↳ [`PgClientOptions`](PgClientOptions.md)

## Properties

### name

• **name**: `string`

Name of the Client; used for logging.

#### Defined in

[src/abstract/Client.ts:18](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L18)

___

### loggers

• `Optional` **loggers**: ``null`` \| [`Loggers`](Loggers.md)

Loggers to be called at different stages.

#### Defined in

[src/abstract/Client.ts:20](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L20)

___

### batchDelayMs

• `Optional` **batchDelayMs**: `MaybeCallable`\<`number`\>

If passed, there will be an artificial queries accumulation delay while
batching the requests. Default is 0 (turned off). Passed to
Batcher#batchDelayMs.

#### Defined in

[src/abstract/Client.ts:24](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L24)
