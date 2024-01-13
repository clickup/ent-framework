[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Loggers

# Interface: Loggers

## Properties

### clientQueryLogger

• `Optional` **clientQueryLogger**: (`props`: [`ClientQueryLoggerProps`](ClientQueryLoggerProps.md)) => `void`

Logs actual queries to the database (after batching).

#### Type declaration

▸ (`props`): `void`

Logs actual queries to the database (after batching).

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`ClientQueryLoggerProps`](ClientQueryLoggerProps.md) |

##### Returns

`void`

#### Defined in

[src/abstract/Loggers.ts:5](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L5)

___

### swallowedErrorLogger

• **swallowedErrorLogger**: (`props`: [`SwallowedErrorLoggerProps`](SwallowedErrorLoggerProps.md)) => `void`

Logs errors which did not throw through (typically recoverable).

#### Type declaration

▸ (`props`): `void`

Logs errors which did not throw through (typically recoverable).

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`SwallowedErrorLoggerProps`](SwallowedErrorLoggerProps.md) |

##### Returns

`void`

#### Defined in

[src/abstract/Loggers.ts:7](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L7)
