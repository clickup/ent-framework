[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / QueryAnnotation

# Interface: QueryAnnotation

Defined in: [src/abstract/QueryAnnotation.ts:27](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryAnnotation.ts#L27)

A debug annotation from each individual place which initiated the query. When
multiple queries are grouped into one large query by Ent Framework (even
cross-async-trace and cross-VC), the resulting large query is accompanied
with all those annotations.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="trace"></a> `trace` | `string` | Trace ID of the series of the queries. |
| <a id="vc"></a> `vc` | `string` | Something which identifies the acting user; it's named `vc` after Ent's VC for simplicity, but at this layer of abstractions, there are no Ents. |
| <a id="debugstack"></a> `debugStack` | `string` | Sometimes a query may be annotated by the source stack trace. It's typically expensive, so it's likely "" in production. |
| <a id="whyclient"></a> `whyClient` | `undefined` \| [`WhyClient`](../type-aliases/WhyClient.md) | Answers, why exactly this Client was selected to send the query to. |
| <a id="attempt"></a> `attempt` | `number` | In case it's a retry, the attempt number will be greater than 0. |
