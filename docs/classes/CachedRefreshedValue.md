[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / CachedRefreshedValue

# Class: CachedRefreshedValue<TValue\>

Utility class to provide a caching layer for a resolverFn with the following
assumptions:
- The value is stable and does not change frequently.
- The resolverFn can throw or take more time to resolve (e.g. outage). In
  that case, the cached value is still valid, unless a fresh value is
  requested with waitRefresh().

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

Initializes the instance.

#### Type parameters

| Name |
| :------ |
| `TValue` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`CachedRefreshedValueOptions`](../interfaces/CachedRefreshedValueOptions.md)<`TValue`\> |

#### Defined in

[src/helpers/CachedRefreshedValue.ts:63](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L63)

## Properties

### options

• `Readonly` **options**: [`CachedRefreshedValueOptions`](../interfaces/CachedRefreshedValueOptions.md)<`TValue`\>

#### Defined in

[src/helpers/CachedRefreshedValue.ts:63](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L63)

## Methods

### cached

▸ **cached**(): `Promise`<`TValue`\>

Returns latest cached value.

#### Returns

`Promise`<`TValue`\>

#### Defined in

[src/helpers/CachedRefreshedValue.ts:76](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L76)

___

### waitRefresh

▸ **waitRefresh**(): `Promise`<`void`\>

Triggers the call to resolverFn() ASAP (i.e. sooner than the next interval
specified in delayMs) and waits for the next successful cache refresh.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/helpers/CachedRefreshedValue.ts:85](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L85)

___

### destroy

▸ **destroy**(): `void`

Destroys the instance. Stops refreshing the value and any call to it will
result in an error.

#### Returns

`void`

#### Defined in

[src/helpers/CachedRefreshedValue.ts:104](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L104)
