[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgClientConn

# Interface: PgClientConn

An opened PostgreSQL connection. Only multi-queries are supported, so we
can't use $N parameter substitutions.

## Properties

### id

• `Optional` **id**: `number`

#### Defined in

[src/pg/PgClient.ts:147](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L147)

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

[src/pg/PgClient.ts:148](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L148)

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

[src/pg/PgClient.ts:151](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L151)
