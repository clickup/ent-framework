[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ToolPing

# Class: ToolPing

Defined in: [src/tools/ToolPing.ts:34](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolPing.ts#L34)

A tool which plays the role of Linux `ping` command, but for master() or
replica() Client of a Shard. Allows to verify that there is no downtime
happening when a PG node goes down or experiences a failover/switchover.

## Constructors

### new ToolPing()

> **new ToolPing**(`options`): [`ToolPing`](ToolPing.md)

Defined in: [src/tools/ToolPing.ts:49](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolPing.ts#L49)

Initializes the instance.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ToolPingOptions`](../interfaces/ToolPingOptions.md) |

#### Returns

[`ToolPing`](ToolPing.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="default_options"></a> `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`ToolPingOptions`](../interfaces/ToolPingOptions.md)\>\> | Default values for the constructor options. |
| <a id="options-1"></a> `options` | `Required`\<[`ToolPingOptions`](../interfaces/ToolPingOptions.md)\> | Options of this tool. |

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncGenerator`\<`string`, `any`, `any`\>

Defined in: [src/tools/ToolPing.ts:57](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolPing.ts#L57)

Runs an endless loop that pings a master() or replica() Client of the
passed Island. Yields the colored output line by line.

#### Returns

`AsyncGenerator`\<`string`, `any`, `any`\>
