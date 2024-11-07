[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / Batcher

# Class: Batcher\<TInput, TOutput\>

Batcher is similar to DataLoader, but with a few important differences:
1. It's strongly typed not only for the output, but for input too. And input
   can be arbitrary, not only strings (e.g. rows).
2. It does requests dedupping for all queries (including selects).
3. It's not limited by read-only requests like DataLoader, and thus it
   doesn't to any caching. Caching is delegated to some other layer (either
   above Batcher or in Runner).

## Type Parameters

| Type Parameter |
| ------ |
| `TInput` |
| `TOutput` |

## Constructors

### new Batcher()

> **new Batcher**\<`TInput`, `TOutput`\>(`runner`, `batchDelayMs`): [`Batcher`](Batcher.md)\<`TInput`, `TOutput`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `runner` | [`Runner`](Runner.md)\<`TInput`, `TOutput`\> |
| `batchDelayMs` | `MaybeCallable`\<`number`\> |

#### Returns

[`Batcher`](Batcher.md)\<`TInput`, `TOutput`\>

#### Defined in

[src/abstract/Batcher.ts:90](https://github.com/clickup/ent-framework/blob/master/src/abstract/Batcher.ts#L90)

## Methods

### flushQueue()

> `protected` **flushQueue**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/abstract/Batcher.ts:32](https://github.com/clickup/ent-framework/blob/master/src/abstract/Batcher.ts#L32)

***

### run()

> **run**(`input`, `annotation`): `Promise`\<`TOutput`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `TInput` |
| `annotation` | [`QueryAnnotation`](../interfaces/QueryAnnotation.md) |

#### Returns

`Promise`\<`TOutput`\>

#### Defined in

[src/abstract/Batcher.ts:95](https://github.com/clickup/ent-framework/blob/master/src/abstract/Batcher.ts#L95)
