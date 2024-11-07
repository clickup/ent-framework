[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / QueryAnnotation

# Interface: QueryAnnotation

A debug annotation from each individual place which initiated the query. When
multiple queries are grouped into one large query by Ent Framework (even
cross-async-trace and cross-VC), the resulting large query is accompanied
with all those annotations.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `trace` | `string` | Trace ID of the series of the queries. |
| `vc` | `string` | Something which identifies the acting user; it's named `vc` after Ent's VC for simplicity, but at this layer of abstractions, there are no Ents. |
| `debugStack` | `string` | Sometimes a query may be annotated by the source stack trace. It's typically expensive, so it's likely "" in production. |
| `whyClient` | `undefined` \| [`WhyClient`](../type-aliases/WhyClient.md) | Answers, why exactly this Client was selected to send the query to. |
| `attempt` | `number` | In case it's a retry, the attempt number will be greater than 0. |
