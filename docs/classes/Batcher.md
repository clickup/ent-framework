[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Batcher

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

• **new Batcher**<`TInput`, `TOutput`\>(`runner`, `entInputLogger?`, `maxBatchSize?`)

#### Type parameters

| Name |
| :------ |
| `TInput` |
| `TOutput` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `runner` | [`Runner`](Runner.md)<`TInput`, `TOutput`\> | `undefined` |
| `entInputLogger?` | (`props`: [`EntInputLoggerProps`](../interfaces/EntInputLoggerProps.md)) => `void` | `undefined` |
| `maxBatchSize` | `number` | `0` |

#### Defined in

[packages/ent-framework/src/abstract/Batcher.ts:134](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Batcher.ts#L134)

## Methods

### flushQueue

▸ `Protected` **flushQueue**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ent-framework/src/abstract/Batcher.ts:181](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Batcher.ts#L181)

___

### flushQueueCaller

▸ `Protected` **flushQueueCaller**(): `void`

#### Returns

`void`

#### Defined in

[packages/ent-framework/src/abstract/Batcher.ts:256](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Batcher.ts#L256)

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

[packages/ent-framework/src/abstract/Batcher.ts:144](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Batcher.ts#L144)
