[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgClientConn

# Interface: PgClientConn

Defined in: [src/pg/PgClient.ts:74](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L74)

An opened low-level PostgreSQL connection.

## Extends

- `PoolClient`

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="processid"></a> `processID?` | `null` \| `number` | Undocumented property of node-postgres, see: https://github.com/brianc/node-postgres/issues/2665 |
| <a id="id"></a> `id?` | `number` | An additional property to the vanilla client: auto-incrementing ID of the connection for logging purposes. |
| <a id="queriessent"></a> `queriesSent?` | `number` | An additional property to the vanilla client: number of queries sent within this connection. |
| <a id="closeat"></a> `closeAt?` | `number` | An additional property to the vanilla client: when do we want to hard-close that connection. |
