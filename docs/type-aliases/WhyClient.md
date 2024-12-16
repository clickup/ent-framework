[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / WhyClient

# Type Alias: WhyClient

> **WhyClient**: `Exclude`\<[`TimelineCaughtUpReason`](TimelineCaughtUpReason.md), `false`\> \| `"replica-bc-stale-replica-freshness"` \| `"master-bc-is-write"` \| `"master-bc-master-freshness"` \| `"master-bc-no-replicas"` \| `"master-bc-replica-not-caught-up"`

A reason why master or replica was chosen to send the query to. The most
noticeable ones are:
- "replica-bc-master-state-unknown": 99% of cases (since writes are rare)
- "master-bc-replica-not-caught-up": happens immediately after each write,
  until the write is propagated to replica
- "replica-bc-caught-up": must happen eventually (in 0.1-2s) after each write
- "replica-bc-pos-expired": signals that the replication lag is huge, we
  should carefully monitor this case and make sure it never happens

## Defined in

[src/abstract/QueryAnnotation.ts:13](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryAnnotation.ts#L13)
