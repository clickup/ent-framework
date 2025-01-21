[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ToolScoreboard

# Class: ToolScoreboard

Defined in: [src/tools/ToolScoreboard.ts:75](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L75)

A tool which plays the role of Linux `top` command, but for the Cluster.
Tracks the state of the Cluster and Clients health.

## Constructors

### new ToolScoreboard()

> **new ToolScoreboard**(`options`): [`ToolScoreboard`](ToolScoreboard.md)

Defined in: [src/tools/ToolScoreboard.ts:127](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L127)

Initializes the instance.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ToolScoreboardOptions`](../interfaces/ToolScoreboardOptions.md) |

#### Returns

[`ToolScoreboard`](ToolScoreboard.md)

## Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="default_options"></a> `DEFAULT_OPTIONS` | `Required`\<`PickPartial`\<[`ToolScoreboardOptions`](../interfaces/ToolScoreboardOptions.md)\>\> | `undefined` | Default values for the constructor options. |
| <a id="options-1"></a> `options` | `Required`\<[`ToolScoreboardOptions`](../interfaces/ToolScoreboardOptions.md)\> | `undefined` | Options of this tool. |
| <a id="islands"></a> `islands` | `Map`\<`number`, \{ `shards`: `number`; `clients`: `Map`\<`ClientIdent`, [`Client`](Client.md)\>; \}\> | `undefined` | Registry of all Islands with Clients. |
| <a id="queries"></a> `queries` | `DefaultMap`\<`number`, `DefaultMap`\<`ClientIdent`, `ToolScoreboardQuery`[]\>\> | `undefined` | Log of queries sent (ping, discovery, tick). |
| <a id="poolstats"></a> `poolStats` | `DefaultMap`\<`number`, `Map`\<`ClientIdent`, \{ `totalConns`: `number`; `idleConns`: `number`; `queuedReqs`: `number`; \}\>\> | `undefined` | Pool stats of Clients. |
| <a id="swallowederrors"></a> `swallowedErrors` | `ToolScoreboardSwallowedError`[] | `[]` | Registry of the recent swallowed errors (pings-independent). |
| <a id="queryerrors"></a> `queryErrors` | `ToolScoreboardQueryError`[] | `[]` | Errors extracted from the queries log. |

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncGenerator`\<[`ToolScoreboard`](ToolScoreboard.md), `any`, `any`\>

Defined in: [src/tools/ToolScoreboard.ts:135](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L135)

Runs an endless loop that updates the Scoreboard with the current state of
the Cluster and yields back on every refreshMs tick.

#### Returns

`AsyncGenerator`\<[`ToolScoreboard`](ToolScoreboard.md), `any`, `any`\>

***

### render()

> **render**(): `string`

Defined in: [src/tools/ToolScoreboard.ts:304](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L304)

Renders the current state of the Scoreboard as a string.

#### Returns

`string`
