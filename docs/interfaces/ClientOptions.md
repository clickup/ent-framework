[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / ClientOptions

# Interface: ClientOptions

Options for Client constructor.

## Hierarchy

- **`ClientOptions`**

  ↳ [`SQLClientOptions`](SQLClientOptions.md)

## Properties

### name

• **name**: `string`

Name of the Client; used for logging.

#### Defined in

[src/abstract/Client.ts:16](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L16)

___

### loggers

• **loggers**: [`Loggers`](Loggers.md)

Loggers to be called at different stages.

#### Defined in

[src/abstract/Client.ts:18](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L18)

___

### batchDelayMs

• `Optional` **batchDelayMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

If passed, there will be an artificial queries accumulation delay while
batching the requests. Default is 0 (turned off). Passed to
Batcher#batchDelayMs.

#### Defined in

[src/abstract/Client.ts:22](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L22)
