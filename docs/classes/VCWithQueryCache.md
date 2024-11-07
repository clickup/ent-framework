[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / VCWithQueryCache

# Class: VCWithQueryCache

If set, Ent cache is enabled for operations in this VC.

## Extends

- [`VCFlavor`](VCFlavor.md)

## Constructors

### new VCWithQueryCache()

> **new VCWithQueryCache**(`options`): [`VCWithQueryCache`](VCWithQueryCache.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | `object` |
| `options.maxQueries` | `number` |

#### Returns

[`VCWithQueryCache`](VCWithQueryCache.md)

#### Overrides

[`VCFlavor`](VCFlavor.md).[`constructor`](VCFlavor.md#constructors)

#### Defined in

[src/ent/VCFlavor.ts:31](https://github.com/clickup/ent-framework/blob/master/src/ent/VCFlavor.ts#L31)

## Properties

| Property | Type |
| ------ | ------ |
| `_tag` | `"VCFlavorClass"` |
| `_tag` | `"VCFlavorInstance"` |
| `options` | `object` |
| `options.maxQueries` | `number` |

## Methods

### toDebugString()

> **toDebugString**(): `string`

Appended to the end of VC.toString() result.

#### Returns

`string`

#### Inherited from

[`VCFlavor`](VCFlavor.md).[`toDebugString`](VCFlavor.md#todebugstring)

#### Defined in

[src/ent/VCFlavor.ts:16](https://github.com/clickup/ent-framework/blob/master/src/ent/VCFlavor.ts#L16)
