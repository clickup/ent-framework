[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ShardNamerOptions

# Interface: ShardNamerOptions

Defined in: src/abstract/ShardNamer.ts:6

Options for ShardNamer constructor.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="nameformat"></a> `nameFormat` | `string` | A format string to turn a Shard number to Shard name (e.g. "sh%04d"). |
| <a id="discoverquery"></a> `discoverQuery` | `MaybeCallable`\<`string`\> | A DB engine query that should return the names of Shards served by this Client. |
