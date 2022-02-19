[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / VCWithQueryCache

# Class: VCWithQueryCache

If set, Ent cache is enabled for operations in this VC.

## Hierarchy

- [`VCFlavor`](VCFlavor.md)

  ↳ **`VCWithQueryCache`**

## Constructors

### constructor

• **new VCWithQueryCache**(`options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Object` |
| `options.maxQueries` | `number` |

#### Overrides

[VCFlavor](VCFlavor.md).[constructor](VCFlavor.md#constructor)

#### Defined in

[packages/ent-framework/src/ent/VCFlavor.ts:31](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VCFlavor.ts#L31)

## Properties

### \_tag

• `Readonly` **\_tag**: ``"VCFlavorInstance"``

#### Inherited from

[VCFlavor](VCFlavor.md).[_tag](VCFlavor.md#_tag)

#### Defined in

[packages/ent-framework/src/ent/VCFlavor.ts:11](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/VCFlavor.ts#L11)

___

### options

• `Readonly` **options**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `maxQueries` | `number` |

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
