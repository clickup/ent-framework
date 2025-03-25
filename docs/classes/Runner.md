[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Runner

# Class: `abstract` Runner\<TInput, TOutput\>

Defined in: [src/abstract/Runner.ts:9](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L9)

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

Defined in: [src/abstract/Runner.ts:70](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L70)

Parameter `name` is typically a table name.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

#### Returns

[`Runner`](Runner.md)\<`TInput`, `TOutput`\>

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="is_write"></a> `IS_WRITE` | `boolean` | If true, it's a write operation. |
| <a id="op"></a> `op` | `string` | Operation name for logging purposes. |
| <a id="maxbatchsize"></a> `maxBatchSize` | `number` | Maximum batch size for this type of operations. |
| <a id="default"></a> `default` | `TOutput` | In case undefined is returned from batching, this value will be returned instead. |
| <a id="name-1"></a> `name` | `string` | - |

## Methods

### runSingle()

> `abstract` **runSingle**(`input`, `annotations`): `Promise`\<`undefined` \| `TOutput`\>

Defined in: [src/abstract/Runner.ts:30](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L30)

Method runSingle is to e.g. produce simple DB requests when we have only
one input to process, not many.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `TInput` |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`\<`undefined` \| `TOutput`\>

***

### runBatch()?

> `abstract` `optional` **runBatch**(`inputs`, `annotations`): `Promise`\<`Map`\<`string`, `TOutput`\>\>

Defined in: [src/abstract/Runner.ts:39](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L39)

Typically issues complex queries with magic. If the method is not defined,
then the runner doesn't support batching, so only runSingle() will be used.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `inputs` | `Map`\<`string`, `TInput`\> |
| `annotations` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md)[] |

#### Returns

`Promise`\<`Map`\<`string`, `TOutput`\>\>

***

### delayForSingleQueryRetryOnError()

> `abstract` **delayForSingleQueryRetryOnError**(`error`): `number` \| `"immediate_retry"` \| `"no_retry"`

Defined in: [src/abstract/Runner.ts:48](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L48)

If the single query's error needs to be retried (e.g. it's a deadlock
error), returns the number of milliseconds to wait before retrying.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `unknown` |

#### Returns

`number` \| `"immediate_retry"` \| `"no_retry"`

***

### shouldDebatchOnError()

> `abstract` **shouldDebatchOnError**(`error`): `boolean`

Defined in: [src/abstract/Runner.ts:65](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L65)

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

***

### key()

> **key**(`_input`): `string`

Defined in: [src/abstract/Runner.ts:77](https://github.com/clickup/ent-framework/blob/master/src/abstract/Runner.ts#L77)

Returns a batch-dedupping key for the input. By default, no dedupping is
performed (i.e. all inputs are processed individually and not collapsed
into one input; e.g. this is needed for inserts).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_input` | `TInput` |

#### Returns

`string`
