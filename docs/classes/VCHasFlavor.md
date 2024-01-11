[@clickup/ent-framework](../README.md) / [Exports](../modules.md) / VCHasFlavor

# Class: VCHasFlavor

Checks that the VC has some flavor.

## Implements

- [`Predicate`](../interfaces/Predicate.md)<`never`\>

## Constructors

### constructor

• **new VCHasFlavor**(`Flavor`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `Flavor` | (...`args`: `never`[]) => [`VCFlavor`](VCFlavor.md) |

#### Defined in

[src/ent/predicates/VCHasFlavor.ts:11](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/VCHasFlavor.ts#L11)

## Properties

### name

• `Readonly` **name**: `string`

#### Implementation of

[Predicate](../interfaces/Predicate.md).[name](../interfaces/Predicate.md#name)

#### Defined in

[src/ent/predicates/VCHasFlavor.ts:9](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/VCHasFlavor.ts#L9)

## Methods

### check

▸ **check**(`vc`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vc` | [`VC`](VC.md) |

#### Returns

`Promise`<`boolean`\>

#### Implementation of

[Predicate](../interfaces/Predicate.md).[check](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/VCHasFlavor.ts:13](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/VCHasFlavor.ts#L13)
