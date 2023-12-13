[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Handler

# Interface: Handler<TLoadArgs, TReturn\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TLoadArgs` | extends `any`[] |
| `TReturn` | `TReturn` |

## Properties

### onCollect

• **onCollect**: (...`args`: `TLoadArgs`) => `void` \| ``"flush"`` \| ``"wait"``

#### Type declaration

▸ (`...args`): `void` \| ``"flush"`` \| ``"wait"``

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `TLoadArgs` |

##### Returns

`void` \| ``"flush"`` \| ``"wait"``

#### Defined in

[src/abstract/Loader.ts:5](https://github.com/clickup/rest-client/blob/master/src/abstract/Loader.ts#L5)

___

### onWait

• `Optional` **onWait**: () => `Promise`<`void`\>

#### Type declaration

▸ (): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

#### Defined in

[src/abstract/Loader.ts:6](https://github.com/clickup/rest-client/blob/master/src/abstract/Loader.ts#L6)

___

### onFlush

• **onFlush**: (`collected`: `number`) => `Promise`<`void`\>

#### Type declaration

▸ (`collected`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `collected` | `number` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/abstract/Loader.ts:7](https://github.com/clickup/rest-client/blob/master/src/abstract/Loader.ts#L7)

___

### onReturn

• **onReturn**: (...`args`: `TLoadArgs`) => `TReturn`

#### Type declaration

▸ (`...args`): `TReturn`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `TLoadArgs` |

##### Returns

`TReturn`

#### Defined in

[src/abstract/Loader.ts:8](https://github.com/clickup/rest-client/blob/master/src/abstract/Loader.ts#L8)
