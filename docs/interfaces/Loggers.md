[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Loggers

# Interface: Loggers

Defined in: [src/abstract/Loggers.ts:10](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loggers.ts#L10)

Loggers are called at different stages of the query lifecycle. We do not use
EventEmitter for several reasons:
1. It is not friendly to mocking in Jest.
2. The built-in EventEmitter is not strongly typed.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="clientquerylogger"></a> `clientQueryLogger?` | (`props`: [`ClientQueryLoggerProps`](ClientQueryLoggerProps.md)) => `void` | Logs actual queries to the database (after batching). |
| <a id="swallowederrorlogger"></a> `swallowedErrorLogger` | (`props`: [`SwallowedErrorLoggerProps`](SwallowedErrorLoggerProps.md)) => `void` | Logs errors which did not throw through (typically recoverable). |
| <a id="runonsharderrorlogger"></a> `runOnShardErrorLogger?` | (`props`: [`RunOnShardErrorLoggerProps`](RunOnShardErrorLoggerProps.md)) => `void` | Called when Island-from-Shard location fails (e.g. no such Shard), or when a query on a particular Shard fails due to any reason (like transport error). Mostly used in unit tests, since it's called for every retry. |
