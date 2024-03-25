[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Loggers

# Interface: Loggers

Loggers are called at different stages of the query lifecycle. We do not use
EventEmitter for several reasons:
1. It is not friendly to mocking in Jest.
2. The built-in EventEmitter is not strongly typed.

## Properties

### clientQueryLogger

• `Optional` **clientQueryLogger**: (`props`: [`ClientQueryLoggerProps`](ClientQueryLoggerProps.md)) => `void`

Logs actual queries to the database (after batching).

#### Type declaration

▸ (`props`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`ClientQueryLoggerProps`](ClientQueryLoggerProps.md) |

##### Returns

`void`

#### Defined in

[src/abstract/Loggers.ts:12](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L12)

___

### swallowedErrorLogger

• **swallowedErrorLogger**: (`props`: [`SwallowedErrorLoggerProps`](SwallowedErrorLoggerProps.md)) => `void`

Logs errors which did not throw through (typically recoverable).

#### Type declaration

▸ (`props`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`SwallowedErrorLoggerProps`](SwallowedErrorLoggerProps.md) |

##### Returns

`void`

#### Defined in

[src/abstract/Loggers.ts:14](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L14)

___

### locateIslandErrorLogger

• `Optional` **locateIslandErrorLogger**: (`props`: [`LocateIslandErrorLoggerProps`](LocateIslandErrorLoggerProps.md)) => `void`

Called when Island-from-Shard location fails (on every retry).

#### Type declaration

▸ (`props`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`LocateIslandErrorLoggerProps`](LocateIslandErrorLoggerProps.md) |

##### Returns

`void`

#### Defined in

[src/abstract/Loggers.ts:16](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L16)
