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

[src/helpers/CachedRefreshedValue.ts:9](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L9)

___

### warningTimeoutMs

• **warningTimeoutMs**: [`MaybeCallable`](../modules.md#maybecallable)<`number`\>

Log a timeout Error if a resolver takes more than X ms to complete.

#### Defined in

[src/helpers/CachedRefreshedValue.ts:11](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L11)

___

### deps

• **deps**: `Object`

The handler deps.handler() is called every deps.delayMs; if it returns a
different value than previously, then waiting for the next delayMs is
interrupted prematurely, and the value gets refreshed.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `delayMs` | [`MaybeCallable`](../modules.md#maybecallable)<`number`\> |
| `handler` | () => `string` |

#### Defined in

[src/helpers/CachedRefreshedValue.ts:15](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L15)

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

[src/helpers/CachedRefreshedValue.ts:21](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L21)

___

### onError

• **onError**: (`error`: `unknown`, `elapsed`: `number`) => `void`

#### Type declaration

▸ (`error`, `elapsed`): `void`

An error handler.

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |
| `elapsed` | `number` |

##### Returns

`void`

#### Defined in

[src/helpers/CachedRefreshedValue.ts:23](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L23)

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

[src/helpers/CachedRefreshedValue.ts:25](https://github.com/clickup/ent-framework/blob/master/src/helpers/CachedRefreshedValue.ts#L25)
