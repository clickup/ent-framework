[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / Handler

# Interface: Handler<TLoadArgs, TReturn\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TLoadArgs` | extends `any`[] |
| `TReturn` | `TReturn` |

## Methods

### onCollect

▸ **onCollect**(...`args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `TLoadArgs` |

#### Returns

`void`

#### Defined in

[packages/ent-framework/src/abstract/Loader.ts:4](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Loader.ts#L4)

___

### onFlush

▸ **onFlush**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/ent-framework/src/abstract/Loader.ts:6](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Loader.ts#L6)

___

### onReturn

▸ **onReturn**(...`args`): `TReturn`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `TLoadArgs` |

#### Returns

`TReturn`

#### Defined in

[packages/ent-framework/src/abstract/Loader.ts:5](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/abstract/Loader.ts#L5)
