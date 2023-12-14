[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Runner

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

[src/abstract/Batcher.ts:84](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L84)

## Properties

### IS\_WRITE

▪ `Static` `Readonly` **IS\_WRITE**: `boolean`

If true, it's a write operation.

#### Defined in

[src/abstract/Batcher.ts:21](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L21)

___

### maxBatchSize

• `Readonly` **maxBatchSize**: `number` = `DEFAULT_MAX_BATCH_SIZE`

Maximum batch size for this type of operations.

#### Defined in

[src/abstract/Batcher.ts:28](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L28)

___

### default

• `Readonly` `Abstract` **default**: `TOutput`

In case undefined is returned from batching, this value will be returned
instead.

#### Defined in

[src/abstract/Batcher.ts:34](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L34)

___

### shardName

• `Readonly` `Abstract` **shardName**: `string`

Name of the Shard for this Runner.

#### Defined in

[src/abstract/Batcher.ts:39](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L39)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[src/abstract/Batcher.ts:84](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L84)

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

[src/abstract/Batcher.ts:45](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L45)

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

[src/abstract/Batcher.ts:53](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L53)

___

### delayForSingleQueryRetryOnError

▸ `Abstract` **delayForSingleQueryRetryOnError**(`error`): `number` \| ``"immediate_retry"`` \| ``"no_retry"``

If the single query's error needs to be retried (e.g. it's a deadlock
error), returns the number of milliseconds to wait before retrying.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `any` |

#### Returns

`number` \| ``"immediate_retry"`` \| ``"no_retry"``

#### Defined in

[src/abstract/Batcher.ts:62](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L62)

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
| `error` | `any` |

#### Returns

`boolean`

#### Defined in

[src/abstract/Batcher.ts:79](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L79)

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

[src/abstract/Batcher.ts:91](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L91)
