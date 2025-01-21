[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ClientErrorKind

# Type Alias: ClientErrorKind

> **ClientErrorKind**: `"data-on-server-is-unchanged"` \| `"unknown-server-state"`

Defined in: [src/abstract/ClientError.ts:35](https://github.com/clickup/ent-framework/blob/master/src/abstract/ClientError.ts#L35)

Sometimes we need to know for sure, is there a chance that the query failed,
but the write was still applied in the database.
