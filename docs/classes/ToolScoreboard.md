[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / ToolScoreboard

# Class: ToolScoreboard

A tool which plays the role of Linux `top` command, but for the Cluster.
Tracks the state of the Cluster and Clients health.

## Constructors

### new ToolScoreboard()

> **new ToolScoreboard**(`options`): [`ToolScoreboard`](ToolScoreboard.md)

Initializes the instance.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ToolScoreboardOptions`](../interfaces/ToolScoreboardOptions.md) |

#### Returns

[`ToolScoreboard`](ToolScoreboard.md)

#### Defined in

[src/tools/ToolScoreboard.ts:126](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L126)

## Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`ToolScoreboardOptions`](../interfaces/ToolScoreboardOptions.md)\>\> | `undefined` | Default values for the constructor options. |
| `options` | `Required`\<[`ToolScoreboardOptions`](../interfaces/ToolScoreboardOptions.md)\> | `undefined` | Options of this tool. |
| `islands` | `Map`\<`number`, `object`\> | `undefined` | Registry of all Islands with Clients. |
| `queries` | `DefaultMap`\<`number`, `DefaultMap`\<`ClientIdent`, `ToolScoreboardQuery`[]\>\> | `undefined` | Log of queries sent (ping, discovery, tick). |
| `poolStats` | `DefaultMap`\<`number`, `Map`\<`ClientIdent`, `object`\>\> | `undefined` | Pool stats of Clients. |
| `swallowedErrors` | `ToolScoreboardSwallowedError`[] | `[]` | Registry of the recent swallowed errors (pings-independent). |
| `queryErrors` | `ToolScoreboardQueryError`[] | `[]` | Errors extracted from the queries log. |

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncGenerator`\<[`ToolScoreboard`](ToolScoreboard.md), `any`, `any`\>

Runs an endless loop that updates the Scoreboard with the current state of
the Cluster and yields back on every refreshMs tick.

#### Returns

`AsyncGenerator`\<[`ToolScoreboard`](ToolScoreboard.md), `any`, `any`\>

#### Defined in

[src/tools/ToolScoreboard.ts:134](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L134)

***

### render()

> **render**(): `string`

Renders the current state of the Scoreboard as a string.

#### Returns

`string`

#### Defined in

[src/tools/ToolScoreboard.ts:303](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L303)
