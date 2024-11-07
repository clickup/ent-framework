[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / Handler

# Interface: Handler\<TLoadArgs, TReturn\>

## Type Parameters

| Type Parameter |
| ------ |
| `TLoadArgs` *extends* `unknown`[] |
| `TReturn` |

## Properties

| Property | Type |
| ------ | ------ |
| `onCollect` | (...`args`: `TLoadArgs`) => `void` \| `"flush"` \| `"wait"` |
| `onWait?` | () => `Promise`\<`void`\> |
| `onFlush` | (`collected`: `number`) => `Promise`\<`void`\> |
| `onReturn` | (...`args`: `TLoadArgs`) => `TReturn` |
