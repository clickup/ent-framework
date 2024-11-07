[**@clickup/ent-framework**](../README.md) • **Docs**

***

[@clickup/ent-framework](../globals.md) / VCHasFlavor

# Class: VCHasFlavor

Checks that the VC has some flavor.

## Implements

- [`Predicate`](../interfaces/Predicate.md)\<`never`\>

## Constructors

### new VCHasFlavor()

> **new VCHasFlavor**(`Flavor`): [`VCHasFlavor`](VCHasFlavor.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `Flavor` | (...`args`) => [`VCFlavor`](VCFlavor.md) |

#### Returns

[`VCHasFlavor`](VCHasFlavor.md)

#### Defined in

[src/ent/predicates/VCHasFlavor.ts:11](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/VCHasFlavor.ts#L11)

## Properties

| Property | Type |
| ------ | ------ |
| `name` | `string` |

## Methods

### check()

> **check**(`vc`): `Promise`\<`boolean`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `vc` | [`VC`](VC.md) |

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`Predicate`](../interfaces/Predicate.md).[`check`](../interfaces/Predicate.md#check)

#### Defined in

[src/ent/predicates/VCHasFlavor.ts:15](https://github.com/clickup/ent-framework/blob/master/src/ent/predicates/VCHasFlavor.ts#L15)
