[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientConn

# Interface: SQLClientConn

An opened PostgreSQL connection. Only multi-queries are supported.

## Properties

### id

• `Optional` **id**: `number`

#### Defined in

[src/sql/SQLClient.ts:24](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L24)

## Methods

### query

▸ **query**<`R`\>(`query`): `Promise`<`QueryResult`<`R`\>[]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `R` | extends `QueryResultRow` = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |

#### Returns

`Promise`<`QueryResult`<`R`\>[]\>

#### Defined in

[src/sql/SQLClient.ts:25](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L25)

___

### release

▸ **release**(`err?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `err?` | `boolean` \| `Error` |

#### Returns

`void`

#### Defined in

[src/sql/SQLClient.ts:28](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L28)
