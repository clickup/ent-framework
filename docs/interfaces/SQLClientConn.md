[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / SQLClientConn

# Interface: SQLClientConn

An opened PostgreSQL connection. Only multi-queries are supported, so we
can't use $N parameter substitutions.

## Properties

### id

• `Optional` **id**: `number`

#### Defined in

[src/sql/SQLClient.ts:55](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L55)

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

[src/sql/SQLClient.ts:56](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L56)

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

[src/sql/SQLClient.ts:59](https://github.com/clickup/rest-client/blob/master/src/sql/SQLClient.ts#L59)
