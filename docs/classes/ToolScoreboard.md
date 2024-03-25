[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / ToolScoreboard

# Class: ToolScoreboard

A tool which plays the role of Linux `top` command, but for the Cluster.
Tracks the state of the Cluster and Clients health.

## Constructors

### constructor

• **new ToolScoreboard**(`options`): [`ToolScoreboard`](ToolScoreboard.md)

Initializes the instance.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`ToolScoreboardOptions`](../interfaces/ToolScoreboardOptions.md) |

#### Returns

[`ToolScoreboard`](ToolScoreboard.md)

#### Defined in

[src/tools/ToolScoreboard.ts:126](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L126)

## Properties

### DEFAULT\_OPTIONS

▪ `Static` `Readonly` **DEFAULT\_OPTIONS**: `Required`\<`PickPartial`\<[`ToolScoreboardOptions`](../interfaces/ToolScoreboardOptions.md)\>\>

Default values for the constructor options.

#### Defined in

[src/tools/ToolScoreboard.ts:77](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L77)

___

### options

• `Readonly` **options**: `Required`\<[`ToolScoreboardOptions`](../interfaces/ToolScoreboardOptions.md)\>

Options of this tool.

#### Defined in

[src/tools/ToolScoreboard.ts:94](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L94)

___

### islands

• **islands**: `Map`\<`number`, \{ `shards`: `number` ; `clients`: `Map`\<`ClientIdent`, [`Client`](Client.md)\>  }\>

Registry of all Islands with Clients.

#### Defined in

[src/tools/ToolScoreboard.ts:97](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L97)

___

### queries

• **queries**: `DefaultMap`\<`number`, `DefaultMap`\<`ClientIdent`, `ToolScoreboardQuery`[]\>\>

Log of queries sent (ping, discovery, tick).

#### Defined in

[src/tools/ToolScoreboard.ts:106](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L106)

___

### poolStats

• **poolStats**: `DefaultMap`\<`number`, `Map`\<`ClientIdent`, \{ `totalConns`: `number` ; `idleConns`: `number` ; `queuedReqs`: `number`  }\>\>

Pool stats of Clients.

#### Defined in

[src/tools/ToolScoreboard.ts:112](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L112)

___

### swallowedErrors

• **swallowedErrors**: `ToolScoreboardSwallowedError`[] = `[]`

Registry of the recent swallowed errors (pings-independent).

#### Defined in

[src/tools/ToolScoreboard.ts:118](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L118)

___

### queryErrors

• **queryErrors**: `ToolScoreboardQueryError`[] = `[]`

Errors extracted from the queries log.

#### Defined in

[src/tools/ToolScoreboard.ts:121](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L121)

## Methods

### [asyncIterator]

▸ **[asyncIterator]**(): `AsyncGenerator`\<[`ToolScoreboard`](ToolScoreboard.md), `any`, `unknown`\>

Runs an endless loop that updates the Scoreboard with the current state of
the Cluster and yields back on every refreshMs tick.

#### Returns

`AsyncGenerator`\<[`ToolScoreboard`](ToolScoreboard.md), `any`, `unknown`\>

#### Defined in

[src/tools/ToolScoreboard.ts:134](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L134)

___

### render

▸ **render**(): `string`

Renders the current state of the Scoreboard as a string.

#### Returns

`string`

#### Defined in

[src/tools/ToolScoreboard.ts:303](https://github.com/clickup/ent-framework/blob/master/src/tools/ToolScoreboard.ts#L303)
