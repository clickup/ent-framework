[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / PgClientConn

# Interface: PgClientConn

An opened low-level PostgreSQL connection.

## Extends

- `PoolClient`

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `processID?` | `null` \| `number` | Undocumented property of node-postgres, see: https://github.com/brianc/node-postgres/issues/2665 |
| `id?` | `number` | An additional property to the vanilla client: auto-incrementing ID of the connection for logging purposes. |
| `queriesSent?` | `number` | An additional property to the vanilla client: number of queries sent within this connection. |
| `closeAt?` | `number` | An additional property to the vanilla client: when do we want to hard-close that connection. |
