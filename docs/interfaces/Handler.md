[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / Handler

# Interface: Handler\<TLoadArgs, TReturn\>

Defined in: [src/abstract/Loader.ts:4](https://github.com/clickup/ent-framework/blob/master/src/abstract/Loader.ts#L4)

## Type Parameters

| Type Parameter |
| ------ |
| `TLoadArgs` *extends* `unknown`[] |
| `TReturn` |

## Properties

| Property | Type |
| ------ | ------ |
| <a id="oncollect"></a> `onCollect` | (...`args`: `TLoadArgs`) => `void` \| `"flush"` \| `"wait"` |
| <a id="onwait"></a> `onWait?` | () => `Promise`\<`void`\> |
| <a id="onflush"></a> `onFlush` | (`collected`: `number`) => `Promise`\<`void`\> |
| <a id="onreturn"></a> `onReturn` | (...`args`: `TLoadArgs`) => `TReturn` |
