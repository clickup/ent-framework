[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / PgClientSubPoolConfig

# Interface: PgClientSubPoolConfig

Defined in: [src/pg/PgClient.ts:115](https://github.com/clickup/ent-framework/blob/master/src/pg/PgClient.ts#L115)

A named low-level Pool config used to create sub-pools. Sub-pool derives
configuration from the default PgClientOptions#config, but allow overrides.
See PgClient#pool() method for details.

## Extends

- `Partial`\<`pg.PoolConfig`\>

## Properties

| Property | Type |
| ------ | ------ |
| <a id="name"></a> `name` | `string` |
