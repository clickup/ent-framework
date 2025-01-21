[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / VCWithQueryCache

# Class: VCWithQueryCache

Defined in: [src/ent/VCFlavor.ts:30](https://github.com/clickup/ent-framework/blob/master/src/ent/VCFlavor.ts#L30)

If set, Ent cache is enabled for operations in this VC.

## Extends

- [`VCFlavor`](VCFlavor.md)

## Constructors

### new VCWithQueryCache()

> **new VCWithQueryCache**(`options`): [`VCWithQueryCache`](VCWithQueryCache.md)

Defined in: [src/ent/VCFlavor.ts:31](https://github.com/clickup/ent-framework/blob/master/src/ent/VCFlavor.ts#L31)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | \{ `maxQueries`: `number`; \} |
| `options.maxQueries` | `number` |

#### Returns

[`VCWithQueryCache`](VCWithQueryCache.md)

#### Overrides

[`VCFlavor`](VCFlavor.md).[`constructor`](VCFlavor.md#constructors)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="_tag"></a> `_tag` | `"VCFlavorClass"` |
| <a id="_tag-1"></a> `_tag` | `"VCFlavorInstance"` |
| <a id="options-1"></a> `options` | `object` |
| `options.maxQueries` | `number` |

## Methods

### toDebugString()

> **toDebugString**(): `string`

Defined in: [src/ent/VCFlavor.ts:16](https://github.com/clickup/ent-framework/blob/master/src/ent/VCFlavor.ts#L16)

Appended to the end of VC.toString() result.

#### Returns

`string`

#### Inherited from

[`VCFlavor`](VCFlavor.md).[`toDebugString`](VCFlavor.md#todebugstring)
