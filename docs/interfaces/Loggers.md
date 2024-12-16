[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Loggers

# Interface: Loggers

Loggers are called at different stages of the query lifecycle. We do not use
EventEmitter for several reasons:
1. It is not friendly to mocking in Jest.
2. The built-in EventEmitter is not strongly typed.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `clientQueryLogger?` | (`props`: [`ClientQueryLoggerProps`](ClientQueryLoggerProps.md)) => `void` | Logs actual queries to the database (after batching). |
| `swallowedErrorLogger` | (`props`: [`SwallowedErrorLoggerProps`](SwallowedErrorLoggerProps.md)) => `void` | Logs errors which did not throw through (typically recoverable). |
| `locateIslandErrorLogger?` | (`props`: [`LocateIslandErrorLoggerProps`](LocateIslandErrorLoggerProps.md)) => `void` | Called when Island-from-Shard location fails (on every retry). |
