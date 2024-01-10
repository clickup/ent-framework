[@time-loop/ent-framework](../README.md) / [Exports](../modules.md) / Registry

# Class: Registry<TData, TObj\>

Represents a container of TObj's that can be created in the container from
the TData data. If the object corresponding to a particular data already
exists, it's returned instead of being created.

## Type parameters

| Name |
| :------ |
| `TData` |
| `TObj` |

## Constructors

### constructor

• **new Registry**<`TData`, `TObj`\>(`options`)

#### Type parameters

| Name |
| :------ |
| `TData` |
| `TObj` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Object` |
| `options.key` | (`data`: `TData`) => `string` |
| `options.create` | (`data`: `TData`) => `TObj` |
| `options.end?` | (`obj`: `TObj`) => `Promise`<`unknown`\> |

#### Defined in

[src/helpers/Registry.ts:11](https://github.com/clickup/ent-framework/blob/master/src/helpers/Registry.ts#L11)

## Methods

### getOrCreate

▸ **getOrCreate**(`data`): [obj: TObj, key: string]

Computes the key for the data and returns the object corresponding to that
key if it already exists in the registry. Otherwise, creates a new object,
adds it to the registry and returns it.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `TData` |

#### Returns

[obj: TObj, key: string]

#### Defined in

[src/helpers/Registry.ts:27](https://github.com/clickup/ent-framework/blob/master/src/helpers/Registry.ts#L27)

___

### deleteExcept

▸ **deleteExcept**(`keepKeys`): `Promise`<`void`\>

Deletes all objects from the registry except those whose keys are in the
keepKeys set. For each object, calls an optional end() handler.

#### Parameters

| Name | Type |
| :------ | :------ |
| `keepKeys` | `Set`<`string`\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/helpers/Registry.ts:42](https://github.com/clickup/ent-framework/blob/master/src/helpers/Registry.ts#L42)
