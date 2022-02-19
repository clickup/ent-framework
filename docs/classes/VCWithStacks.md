[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / VCWithStacks

# Class: VCWithStacks

If turned on, the debug logs will contain caller stack traces for each Ent
query. This is expensive, use in dev mode only!

## Hierarchy

- [`VCFlavor`](VCFlavor.md)

  ↳ **`VCWithStacks`**

## Constructors

### constructor

• **new VCWithStacks**()

#### Inherited from

[VCFlavor](VCFlavor.md).[constructor](VCFlavor.md#constructor)

## Properties

### \_tag

• `Readonly` **\_tag**: ``"VCFlavorInstance"``

#### Inherited from

[VCFlavor](VCFlavor.md).[_tag](VCFlavor.md#_tag)

#### Defined in

[packages/ent-framework/src/ent/VCFlavor.ts:11](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VCFlavor.ts#L11)

___

### \_tag

▪ `Static` `Readonly` **\_tag**: ``"VCFlavorClass"``

#### Inherited from

[VCFlavor](VCFlavor.md).[_tag](VCFlavor.md#_tag)

#### Defined in

[packages/ent-framework/src/ent/VCFlavor.ts:10](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VCFlavor.ts#L10)

## Methods

### toDebugString

▸ **toDebugString**(): `string`

Appended to the end of VC.toString() result.

#### Returns

`string`

#### Inherited from

[VCFlavor](VCFlavor.md).[toDebugString](VCFlavor.md#todebugstring)

#### Defined in

[packages/ent-framework/src/ent/VCFlavor.ts:16](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VCFlavor.ts#L16)
