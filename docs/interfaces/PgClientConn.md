[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgClientConn

# Interface: PgClientConn

An opened PostgreSQL connection. Only multi-queries are supported, so we
can't use $N parameter substitutions.

## Properties

### id

• `Optional` **id**: `number`

#### Defined in

[src/pg/PgClient.ts:73](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L73)

___

### queriesSent

• `Optional` **queriesSent**: `number`

#### Defined in

[src/pg/PgClient.ts:74](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L74)

## Methods

### query

▸ **query**\<`R`\>(`query`): `Promise`\<`QueryResult`\<`R`\>[]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `R` | extends `QueryResultRow` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |

#### Returns

`Promise`\<`QueryResult`\<`R`\>[]\>

#### Defined in

[src/pg/PgClient.ts:75](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L75)

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

[src/pg/PgClient.ts:78](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L78)
