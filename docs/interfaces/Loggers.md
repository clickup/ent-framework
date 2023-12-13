[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Loggers

# Interface: Loggers

## Properties

### clientQueryLogger

• `Optional` **clientQueryLogger**: (`props`: [`ClientQueryLoggerProps`](ClientQueryLoggerProps.md)) => `void`

#### Type declaration

▸ (`props`): `void`

Logs actual queries to the database (e.g. raw SQL queries, after
batching).

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`ClientQueryLoggerProps`](ClientQueryLoggerProps.md) |

##### Returns

`void`

#### Defined in

[src/abstract/Loggers.ts:6](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L6)

___

### swallowedErrorLogger

• **swallowedErrorLogger**: (`props`: [`SwallowedErrorLoggerProps`](SwallowedErrorLoggerProps.md)) => `void`

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

[src/abstract/Loggers.ts:8](https://github.com/clickup/rest-client/blob/master/src/abstract/Loggers.ts#L8)
