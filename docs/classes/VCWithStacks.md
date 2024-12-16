[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / VCWithStacks

# Class: VCWithStacks

If turned on, the debug logs will contain caller stack traces for each Ent
query. This is expensive, use in dev mode only!

## Extends

- [`VCFlavor`](VCFlavor.md)

## Constructors

### new VCWithStacks()

> **new VCWithStacks**(): [`VCWithStacks`](VCWithStacks.md)

#### Returns

[`VCWithStacks`](VCWithStacks.md)

#### Inherited from

[`VCFlavor`](VCFlavor.md).[`constructor`](VCFlavor.md#constructors)

## Properties

| Property | Type |
| ------ | ------ |
| `_tag` | `"VCFlavorClass"` |
| `_tag` | `"VCFlavorInstance"` |

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
