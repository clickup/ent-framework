[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / CachedRefreshedValue

# Class: CachedRefreshedValue<TValue\>

Utility class to provide a caching layer for a resolverFn with the following
assumptions:
- The value is stable and does not change frequently.
- The resolverFn can throw or take more time to resolve (e.g. outage). In
  that case, the cached value is still valid, unless a fresh value is
  requested.

The implementation is as follows:
- Once value is accessed, we schedule an endless loop of calling resolver to
  get latest value.
- The result is cached, so next calls will return it immediately in most of
  the cases.
- Once every delayMs we call resolverFn to get latest value. All calls during
  this time will get previous value (if available).

## Type parameters

| Name |
| :------ |
| `TValue` |

## Constructors

### constructor

• **new CachedRefreshedValue**<`TValue`\>(`options`)

#### Type parameters

| Name |
| :------ |
| `TValue` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`CachedRefreshedValueOptions`](../interfaces/CachedRefreshedValueOptions.md)<`TValue`\> |

#### Defined in

[src/helpers/CachedRefreshedValue.ts:52](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L52)

## Properties

### options

• `Readonly` **options**: [`CachedRefreshedValueOptions`](../interfaces/CachedRefreshedValueOptions.md)<`TValue`\>

#### Defined in

[src/helpers/CachedRefreshedValue.ts:52](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L52)

## Methods

### cached

▸ **cached**(): `Promise`<`TValue`\>

Returns latest cached value.

#### Returns

`Promise`<`TValue`\>

#### Defined in

[src/helpers/CachedRefreshedValue.ts:57](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L57)

___

### waitRefresh

▸ **waitRefresh**(): `Promise`<`void`\>

Waits for the next successful cache refresh.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/helpers/CachedRefreshedValue.ts:65](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L65)

___

### destroy

▸ **destroy**(): `void`

Destroys the instance. Stops refreshing the value and any call to it will
result in an error.

#### Returns

`void`

#### Defined in

[src/helpers/CachedRefreshedValue.ts:82](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L82)
