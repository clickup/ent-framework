[@slapdash/ent-framework](../README.md) / [Exports](../modules.md) / VCHasFlavor

# Class: VCHasFlavor

Checks if the VC has some flavor.

## Implements

- [`Predicate`](../interfaces/Predicate.md)<`never`\>

## Constructors

### constructor

• **new VCHasFlavor**(`Flavor`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `Flavor` | (...`args`: `any`[]) => [`VCFlavor`](VCFlavor.md) |

#### Defined in

[packages/ent-framework/src/ent/predicates/VCHasFlavor.ts:11](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/VCHasFlavor.ts#L11)

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[packages/ent-framework/src/ent/predicates/VCHasFlavor.ts:9](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/VCHasFlavor.ts#L9)

## Methods

### check

▸ **check**(`vc`, `_row`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |
| `_row` | `never` |

#### Returns

`Promise`<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[packages/ent-framework/src/ent/predicates/VCHasFlavor.ts:13](https://github.com/time-loop/slapdash/blob/master/packages/ent-framework/src/ent/predicates/VCHasFlavor.ts#L13)
