[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Loader

# Class: Loader<TLoadArgs, TReturn\>

Loader allows to batch single-item requests into batches. It uses a different
architecture than Facebook's DataLoader:

- it's more developers-friendly: multi-parameter loadings, you may implement
  automatic deduplication of requests at onCollect stage, no requirement to
  serialize/deserialize requests into string keys;
- strong-typed load() and handler arguments.

To create your own specific loader:
1. Define a handler class with onCollect/onReturn/onFlush methods.
2. In onCollect, accumulate the incoming requests in the handler object's
   private property.
3. In onFlush, process what you accumulated so far and save to another
   handler object's private property (and by adding, say, delay(50) in the
   beginning of onFlush, you may group the requests coming within the 1st 50
   ms).
3. In onReturn, extract the result corresponding to the request and return
   it, so the caller will receive it seamlessly as a load() return value.

In the future, Batcher may be refactored to use Loader as the underlying
engine, but for now they're separate (Batcher is much more domain logic
specific and Loader is completely abstract).

## Type parameters

| Name | Type |
| :------ | :------ |
| `TLoadArgs` | extends `unknown`[] |
| `TReturn` | `TReturn` |

## Constructors

### constructor

• **new Loader**<`TLoadArgs`, `TReturn`\>(`handlerCreator`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TLoadArgs` | extends `unknown`[] |
| `TReturn` | `TReturn` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `handlerCreator` | () => [`Handler`](../interfaces/Handler.md)<`TLoadArgs`, `TReturn`\> |

#### Defined in

[src/abstract/Loader.ts:45](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loader.ts#L45)

## Methods

### load

▸ **load**(`...args`): `Promise`<`TReturn`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `TLoadArgs` |

#### Returns

`Promise`<`TReturn`\>

#### Defined in

[src/abstract/Loader.ts:47](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loader.ts#L47)
