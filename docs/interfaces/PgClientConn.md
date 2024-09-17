[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / PgClientConn

# Interface: PgClientConn

An opened low-level PostgreSQL connection.

## Hierarchy

- `PoolClient`

  ↳ **`PgClientConn`**

## Properties

### processID

• `Optional` **processID**: ``null`` \| `number`

Undocumented property of node-postgres, see:
https://github.com/brianc/node-postgres/issues/2665

#### Defined in

[src/pg/PgClient.ts:74](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L74)

___

### id

• `Optional` **id**: `number`

An additional property to the vanilla client: auto-incrementing ID of the
connection for logging purposes.

#### Defined in

[src/pg/PgClient.ts:77](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L77)

___

### queriesSent

• `Optional` **queriesSent**: `number`

An additional property to the vanilla client: number of queries sent
within this connection.

#### Defined in

[src/pg/PgClient.ts:80](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L80)

___

### closeAt

• `Optional` **closeAt**: `number`

An additional property to the vanilla client: when do we want to
hard-close that connection.

#### Defined in

[src/pg/PgClient.ts:83](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L83)
