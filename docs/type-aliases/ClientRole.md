[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / ClientRole

# Type Alias: ClientRole

> **ClientRole**: `"master"` \| `"replica"` \| `"unknown"`

Defined in: [src/abstract/Client.ts:34](https://github.com/clickup/ent-framework/blob/master/src/abstract/Client.ts#L34)

Role of the Client as reported after the last successful query. If we know
for sure that the Client is a master or a replica, the role will be "master"
or "replica" correspondingly. If no queries were run by the Client yet (i.e.
we don't know the role for sure), the role is assigned to "unknown".
