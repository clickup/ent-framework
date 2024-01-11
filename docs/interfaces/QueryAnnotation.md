[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / QueryAnnotation

# Interface: QueryAnnotation

A debug annotation from each individual place which initiated the query. When
multiple queries are grouped into one large query by Ent Framework (even
cross-async-trace and cross-VC), the resulting large query is accompanied
with all those annotations.

## Properties

### trace

• `Readonly` **trace**: `string`

Trace ID of the series of the queries.

#### Defined in

[src/abstract/QueryAnnotation.ts:29](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryAnnotation.ts#L29)

___

### vc

• `Readonly` **vc**: `string`

Something which identifies the acting user; it's named `vc` after Ent's VC
for simplicity, but at this layer of abstractions, there are no Ents.

#### Defined in

[src/abstract/QueryAnnotation.ts:32](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryAnnotation.ts#L32)

___

### debugStack

• `Readonly` **debugStack**: `string`

Sometimes a query may be annotated by the source stack trace. It's
typically expensive, so it's likely "" in production. Non-empty string may
enable detailed SQL logging as well.

#### Defined in

[src/abstract/QueryAnnotation.ts:36](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryAnnotation.ts#L36)

___

### whyClient

• `Readonly` **whyClient**: `undefined` \| [`WhyClient`](../modules.md#whyclient)

Answers, why exactly this Client was selected to send the query to.

#### Defined in

[src/abstract/QueryAnnotation.ts:38](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryAnnotation.ts#L38)

___

### attempt

• `Readonly` **attempt**: `number`

In case it's a retry, the attempt number will be greater than 0.

#### Defined in

[src/abstract/QueryAnnotation.ts:40](https://github.com/clickup/ent-framework/blob/master/src/abstract/QueryAnnotation.ts#L40)
