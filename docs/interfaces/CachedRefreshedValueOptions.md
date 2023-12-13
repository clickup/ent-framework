[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / CachedRefreshedValueOptions

# Interface: CachedRefreshedValueOptions<TValue\>

## Type parameters

| Name |
| :------ |
| `TValue` |

## Properties

### delayMs

• **delayMs**: `number`

Delay between calling resolver.

#### Defined in

[src/helpers/CachedRefreshedValue.ts:8](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L8)

___

### warningTimeoutMs

• **warningTimeoutMs**: `number`

Log a timeout Error if a resolver takes more than X ms to complete.

#### Defined in

[src/helpers/CachedRefreshedValue.ts:10](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L10)

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

[src/helpers/CachedRefreshedValue.ts:13](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L13)

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

[src/helpers/CachedRefreshedValue.ts:15](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L15)

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

[src/helpers/CachedRefreshedValue.ts:17](https://github.com/clickup/rest-client/blob/master/src/helpers/CachedRefreshedValue.ts#L17)
