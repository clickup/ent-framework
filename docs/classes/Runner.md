[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Runner

# Class: `abstract` Runner\<TInput, TOutput\>

Knows how to translate individual strongly typed requests into DB language
and how to parse the result back.

## Extended by

- [`PgRunner`](PgRunner.md)

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` |
| `TOutput` |

## Constructors

### new Runner()

> **new Runner**\<`TInput`, `TOutput`\>(`name`): [`Runner`](Runner.md)\<`TInput`, `TOutput`\>

Parameter `name` is typically a table name.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

#### Returns

[`Runner`](Runner.md)\<`TInput`, `TOutput`\>

#### Defined in

[src/abstract/Runner.ts:69](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L69)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `IS_WRITE` | `boolean` | If true, it's a write operation. |
| `op` | `string` | Operation name for logging purposes. |
| `maxBatchSize` | `number` | Maximum batch size for this type of operations. |
| `default` | `TOutput` | In case undefined is returned from batching, this value will be returned instead. |
| `name` | `string` | - |

## Methods

### runSingle()

> `abstract` **runSingle**(`input`, `annotations`): `Promise`\<`undefined` \| `TOutput`\>

Method runSingle is to e.g. produce simple DB requests when we have only
one input to process, not many.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `TInput` |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`\<`undefined` \| `TOutput`\>

#### Defined in

[src/abstract/Runner.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L30)

***

### runBatch()?

> `abstract` `optional` **runBatch**(`inputs`, `annotations`): `Promise`\<`Map`\<`string`, `TOutput`\>\>

Typically issues complex queries with magic.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `inputs` | `Map`\<`string`, `TInput`\> |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`\<`Map`\<`string`, `TOutput`\>\>

#### Defined in

[src/abstract/Runner.ts:38](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L38)

***

### delayForSingleQueryRetryOnError()

> `abstract` **delayForSingleQueryRetryOnError**(`error`): `number` \| `"immediate_retry"` \| `"no_retry"`

If the single query's error needs to be retried (e.g. it's a deadlock
error), returns the number of milliseconds to wait before retrying.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `unknown` |

#### Returns

`number` \| `"immediate_retry"` \| `"no_retry"`

#### Defined in

[src/abstract/Runner.ts:47](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L47)

***

### shouldDebatchOnError()

> `abstract` **shouldDebatchOnError**(`error`): `boolean`

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

| Parameter | Type |
| ------ | ------ |
| `error` | `unknown` |

#### Returns

`boolean`

#### Defined in

[src/abstract/Runner.ts:64](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L64)

***

### key()

> **key**(`_input`): `string`

Returns a batch-dedupping key for the input. By default, no dedupping is
performed (i.e. all inputs are processed individually and not collapsed
into one input; e.g. this is needed for inserts).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_input` | `TInput` |

#### Returns

`string`

#### Defined in

[src/abstract/Runner.ts:76](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L76)
