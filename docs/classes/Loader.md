[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Loader

# Class: Loader<TLoadArgs, TReturn\>

Loader allows to batch single-item requests into batches. It uses a different
architecture than Facebook's DataLoader:
- it's more developers-friendly: multi-parameter loadings, automatic
  deduplication of requests, no requirement to serialize/deserialize requests
  into string keys;
- strong-typed load() and handler arguments.

To create your own specific loader, define a handler class with
onCollect/onReturn/onFlush methods.

In the future, Batcher may be refactored to use Loader as the underlying
engine, but for now they're separate (Batcher is much more domain logic
specific and Loader is completely abstract).

## Type parameters

| Name | Type |
| :------ | :------ |
| `TLoadArgs` | extends `any`[] |
| `TReturn` | `TReturn` |

## Constructors

### constructor

• **new Loader**<`TLoadArgs`, `TReturn`\>(`handlerCreator`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TLoadArgs` | extends `any`[] |
| `TReturn` | `TReturn` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `handlerCreator` | () => [`Handler`](../interfaces/Handler.md)<`TLoadArgs`, `TReturn`\> |

#### Defined in

[packages/ent-framework/src/abstract/Loader.ts:29](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Loader.ts#L29)

## Methods

### load

▸ **load**(...`args`): `Promise`<`TReturn`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `TLoadArgs` |

#### Returns

`Promise`<`TReturn`\>

#### Defined in

[packages/ent-framework/src/abstract/Loader.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Loader.ts#L31)

___

### waitFlush

▸ **waitFlush**<`TResult`\>(): `Promise`<`TResult`\>

#### Type parameters

| Name |
| :------ |
| `TResult` |

#### Returns

`Promise`<`TResult`\>

#### Defined in

[packages/ent-framework/src/abstract/Loader.ts:42](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Loader.ts#L42)
