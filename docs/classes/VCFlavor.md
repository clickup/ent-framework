[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / VCFlavor

# Class: `abstract` VCFlavor

Defined in: [src/ent/VCFlavor.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/VCFlavor.ts#L9)

VCFlavor is some piece of info which is transitively attached to a VC and is
preserved when VC derivation (upgrade/downgrade) is happening. This piece of
info may be just an object of a separate class with no data (acts like a
boolean flag), or it can be an object with payload.

For each flavor type, only a single VCFlavor object may exist.

## Extended by

- [`VCWithStacks`](VCWithStacks.md)
- [`VCWithQueryCache`](VCWithQueryCache.md)

## Constructors

### new VCFlavor()

> **new VCFlavor**(): [`VCFlavor`](VCFlavor.md)

#### Returns

[`VCFlavor`](VCFlavor.md)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="_tag"></a> `_tag` | `"VCFlavorClass"` |
| <a id="_tag-1"></a> `_tag` | `"VCFlavorInstance"` |

## Methods

### toDebugString()

> **toDebugString**(): `string`

Defined in: [src/ent/VCFlavor.ts:16](https://github.com/clickup/ent-framework/blob/master/src/ent/VCFlavor.ts#L16)

Appended to the end of VC.toString() result.

#### Returns

`string`
