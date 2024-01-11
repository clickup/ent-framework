[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / Runner

# Class: Runner<TInput, TOutput\>

Knows how to translate individual strongly typed requests into DB language
(e.g. SQL, Redis etc.) and how to parse the result back.

## Type parameters

| Name |
| :------ |
| `TInput` |
| `TOutput` |

## Hierarchy

- **`Runner`**

  ↳ [`SQLRunner`](SQLRunner.md)

## Constructors

### constructor

• **new Runner**<`TInput`, `TOutput`\>(`name`)

Parameter `name` is typically a table name.

#### Type parameters

| Name |
| :------ |
| `TInput` |
| `TOutput` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Defined in

[src/abstract/Runner.ts:69](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L69)

## Properties

### IS\_WRITE

▪ `Static` `Readonly` **IS\_WRITE**: `boolean`

If true, it's a write operation.

#### Defined in

[src/abstract/Runner.ts:11](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L11)

___

### op

• `Readonly` `Abstract` **op**: `string`

Operation name for logging purposes.

#### Defined in

[src/abstract/Runner.ts:17](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L17)

___

### maxBatchSize

• `Readonly` `Abstract` **maxBatchSize**: `number`

Maximum batch size for this type of operations.

#### Defined in

[src/abstract/Runner.ts:20](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L20)

___

### default

• `Readonly` `Abstract` **default**: `TOutput`

In case undefined is returned from batching, this value will be returned
instead.

#### Defined in

[src/abstract/Runner.ts:24](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L24)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[src/abstract/Runner.ts:69](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L69)

## Methods

### runSingle

▸ `Abstract` **runSingle**(`input`, `annotations`): `Promise`<`undefined` \| `TOutput`\>

Method runSingle is to e.g. produce simple SQL requests when we have only
one input to process, not many.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `TInput` |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`<`undefined` \| `TOutput`\>

#### Defined in

[src/abstract/Runner.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L30)

___

### runBatch

▸ `Optional` `Abstract` **runBatch**(`inputs`, `annotations`): `Promise`<`Map`<`string`, `TOutput`\>\>

Typically issues complex queries with magic.

#### Parameters

| Name | Type |
| :------ | :------ |
| `inputs` | `Map`<`string`, `TInput`\> |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`<`Map`<`string`, `TOutput`\>\>

#### Defined in

[src/abstract/Runner.ts:38](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L38)

___

### delayForSingleQueryRetryOnError

▸ `Abstract` **delayForSingleQueryRetryOnError**(`error`): `number` \| ``"immediate_retry"`` \| ``"no_retry"``

If the single query's error needs to be retried (e.g. it's a deadlock
error), returns the number of milliseconds to wait before retrying.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |

#### Returns

`number` \| ``"immediate_retry"`` \| ``"no_retry"``

#### Defined in

[src/abstract/Runner.ts:47](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L47)

___

### shouldDebatchOnError

▸ `Abstract` **shouldDebatchOnError**(`error`): `boolean`

If this method returns true for an error object, the batch is split back
into sub-queries, they are executed individually, and then the response of
each query is delivered to each caller individually. Used mostly for e.g.
batch-deadlock errors or for FK constraint errors when it makes sense to
retry other members of the batch and not fail it entirely hurting other
innocent queries.

We can do this, because we know that if some transaction is aborted, it's
always safe to retry it. (If we're not sure about the transaction, e.g. the
Client doesn't support transactions at all, then the method should return
false.)

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |

#### Returns

`boolean`

#### Defined in

[src/abstract/Runner.ts:64](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L64)

___

### key

▸ **key**(`_input`): `string`

Returns a batch-dedupping key for the input. By default, no dedupping is
performed (i.e. all inputs are processed individually and not collapsed
into one input; e.g. this is needed for inserts).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_input` | `TInput` |

#### Returns

`string`

#### Defined in

[src/abstract/Runner.ts:76](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L76)
