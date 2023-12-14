[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / CachedRefreshedValueOptions

# Interface: CachedRefreshedValueOptions<TValue\>

## Type parameters

| Name |
| :------ |
| `TValue` |

## Properties

### delayMs

• **delayMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

Delay between calling resolver.

#### Defined in

[src/helpers/CachedRefreshedValue.ts:9](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L9)

___

### warningTimeoutMs

• **warningTimeoutMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

Log a timeout Error if a resolver takes more than X ms to complete.

#### Defined in

[src/helpers/CachedRefreshedValue.ts:11](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L11)

___

### resolverFn

• **resolverFn**: () => `Promise`<`TValue`\>

#### Type declaration

▸ (): `Promise`<`TValue`\>

A resolver function that returns the value. It's assumed that this
function would eventually either resolve or throw.

##### Returns

`Promise`<`TValue`\>

#### Defined in

[src/helpers/CachedRefreshedValue.ts:14](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L14)

___

### onError

• **onError**: (`error`: `unknown`) => `void`

#### Type declaration

▸ (`error`): `void`

An error handler.

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |

##### Returns

`void`

#### Defined in

[src/helpers/CachedRefreshedValue.ts:16](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L16)

___

### delay

• **delay**: (`ms`: `number`) => `Promise`<`void`\>

#### Type declaration

▸ (`ms`): `Promise`<`void`\>

A custom delay implementation.

##### Parameters

| Name | Type |
| :------ | :------ |
| `ms` | `number` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/helpers/CachedRefreshedValue.ts:18](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L18)
