[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / ToolPing

# Class: ToolPing

A tool which plays the role of Linux `ping` command, but for master() or
replica() Client of a Shard. Allows to verify that there is no downtime
happening when a PG node goes down or experiences a failover/switchover.

## Constructors

### constructor

• **new ToolPing**(`options`): [`ToolPing`](ToolPing.md)

Initializes the instance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`ToolPingOptions`](../interfaces/ToolPingOptions.md) |

#### Returns

[`ToolPing`](ToolPing.md)

#### Defined in

[src/tools/ToolPing.ts:49](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolPing.ts#L49)

## Properties

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`\<`PickPartial`\<[`ToolPingOptions`](../interfaces/ToolPingOptions.md)\>\>

Default values for the constructor options.

#### Defined in

[src/tools/ToolPing.ts:36](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolPing.ts#L36)

___

### options

• `Readonly` **options**: `Required`\<[`ToolPingOptions`](../interfaces/ToolPingOptions.md)\>

Options of this tool.

#### Defined in

[src/tools/ToolPing.ts:44](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolPing.ts#L44)

## Methods

### [asyncIterator]

▸ **[asyncIterator]**(): `AsyncGenerator`\<`string`, `any`, `unknown`\>

Runs an endless loop that pings a master() or replica() Client of the
passed Island. Yields the colored output line by line.

#### Returns

`AsyncGenerator`\<`string`, `any`, `unknown`\>

#### Defined in

[src/tools/ToolPing.ts:57](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolPing.ts#L57)
