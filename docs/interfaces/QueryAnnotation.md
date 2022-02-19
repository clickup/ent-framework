[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / QueryAnnotation

# Interface: QueryAnnotation

A debug annotation of an object which runs a query.

## Properties

### debugStack

• `Readonly` **debugStack**: `string`

Sometimes a query may be annotated by the source stack trace. It's
typically expensive, so it's likely "" in production. Non-empty string may
enable detailed SQL logging as well.

#### Defined in

[packages/ent-framework/src/abstract/QueryAnnotation.ts:33](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/QueryAnnotation.ts#L33)

___

### trace

• `Readonly` **trace**: `string`

Trace ID of the series of the queries.

#### Defined in

[packages/ent-framework/src/abstract/QueryAnnotation.ts:26](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/QueryAnnotation.ts#L26)

___

### vc

• `Readonly` **vc**: `string`

Something which identifies the acting user; it's named `vc` after Ent's VC
for simplicity, but at this layer of abstractions, there are no Ents.

#### Defined in

[packages/ent-framework/src/abstract/QueryAnnotation.ts:29](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/QueryAnnotation.ts#L29)

___

### whyClient

• `Readonly` **whyClient**: `undefined` \| [`WhyClient`](../modules.md#whyclient)

Answers, why exactly this client was selected to send the query to.

#### Defined in

[packages/ent-framework/src/abstract/QueryAnnotation.ts:35](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/QueryAnnotation.ts#L35)
