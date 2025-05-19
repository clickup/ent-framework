[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgClientConn

# Interface: PgClientConn\<TPool\>

Defined in: [src/pg/PgClient.ts:95](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L95)

An opened low-level PostgreSQL connection.

## Extends

- `PoolClient`

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TPool` *extends* `pg.Pool` | `pg.Pool` |

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="pool"></a> `pool` | `TPool` | Pool instance that created this connection. |
| <a id="id"></a> `id` | `number` | An additional property to the vanilla client: auto-incrementing ID of the connection for logging purposes. |
| <a id="queriessent"></a> `queriesSent` | `number` | An additional property to the vanilla client: number of queries sent within this connection. |
| <a id="closeat"></a> `closeAt` | `null` \| `number` | An additional property to the vanilla client: when do we want to hard-close that connection. |
