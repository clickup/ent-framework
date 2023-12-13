[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Batcher

# Class: Batcher<TInput, TOutput\>

Batcher is similar to DataLoader, but with a few important differences:
1. It's strongly typed not only for the output, but for input too. And input
   can be arbitrary, not only strings (e.g. rows).
2. It does requests dedupping for all queries (including selects).
3. It's not limited by read-only requests like DataLoader, and thus it
   doesn't to any caching. Caching is delegated to some other layer (either
   above Batcher or in Runner).

## Type parameters

| Name |
| :------ |
| `TInput` |
| `TOutput` |

## Constructors

### constructor

• **new Batcher**<`TInput`, `TOutput`\>(`runner`, `maxBatchSize?`, `batchDelayMs?`)

#### Type parameters

| Name |
| :------ |
| `TInput` |
| `TOutput` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `runner` | [`Runner`](Runner.md)<`TInput`, `TOutput`\> | `undefined` |
| `maxBatchSize` | `number` | `0` |
| `batchDelayMs` | `number` \| () => `number` | `0` |

#### Defined in

[src/abstract/Batcher.ts:183](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L183)

## Methods

### flushQueue

▸ `Protected` **flushQueue**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/abstract/Batcher.ts:125](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L125)

___

### run

▸ **run**(`input`, `annotation`): `Promise`<`TOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `TInput` |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`<`TOutput`\>

#### Defined in

[src/abstract/Batcher.ts:196](https://github.com/clickup/rest-client/blob/master/src/abstract/Batcher.ts#L196)
