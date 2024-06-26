[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / VCFlavor

# Class: VCFlavor

VCFlavor is some piece of info which is transitively attached to a VC and is
preserved when VC derivation (upgrade/downgrade) is happening. This piece of
info may be just an object of a separate class with no data (acts like a
boolean flag), or it can be an object with payload.

For each flavor type, only a single VCFlavor object may exist.

## Hierarchy

- **`VCFlavor`**

  ↳ [`VCWithStacks`](VCWithStacks.md)

  ↳ [`VCWithQueryCache`](VCWithQueryCache.md)

## Constructors

### constructor

• **new VCFlavor**(): [`VCFlavor`](VCFlavor.md)

#### Returns

[`VCFlavor`](VCFlavor.md)

## Properties

### \_tag

▪ `Static` `Readonly` **\_tag**: ``"VCFlavorClass"``

#### Defined in

[src/ent/VCFlavor.ts:10](https://github.com/clickup/ent-framework/blob/master/src/ent/VCFlavor.ts#L10)

___

### \_tag

• `Readonly` **\_tag**: ``"VCFlavorInstance"``

#### Defined in

[src/ent/VCFlavor.ts:11](https://github.com/clickup/ent-framework/blob/master/src/ent/VCFlavor.ts#L11)

## Methods

### toDebugString

▸ **toDebugString**(): `string`

Appended to the end of VC.toString() result.

#### Returns

`string`

#### Defined in

[src/ent/VCFlavor.ts:16](https://github.com/clickup/ent-framework/blob/master/src/ent/VCFlavor.ts#L16)
